import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import flexsearch, { type SimpleDocumentSearchResultSetUnit } from 'flexsearch';
const { Document } = flexsearch;

export interface ILicense {
  reference: string;
  isDeprecatedLicenseId: boolean;
  detailsUrl: string;
  referenceNumber: number;
  name: string;
  licenseId: string;
  seeAlso: string[];
  isOsiApproved: boolean;
  isFsfLibre?: boolean;
}

export interface ILicenseDetail {
  isDeprecatedLicenseId: boolean;
  licenseText: string;
  standardLicenseTemplate?: string;
  name: string;
  licenseComments: string;
  licenseId: string;
  licenseTextHtml: string;
}

export interface LicenseList {
  releaseDate: string;
  licenseListVersion: string;
  licenses: ILicense[];
}

let licenses: IndexedLicense[] | null = null;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.resolve(__dirname, '../license-list-data/json');

async function getRemoteLicenses() {
  const res = await fetch('https://spdx.org/licenses/licenses.json');
  if (!res.ok) {
    throw new Error('Fail to get license list.');
  }
  return (await res.json()) as LicenseList;
}

export async function getLocalLicense(licenseId: string) {
  const licensePath = path.resolve(dataPath, `./details/${licenseId}.json`);
  const jsonstr = await readFile(licensePath, { encoding: 'utf-8' });
  return JSON.parse(jsonstr) as ILicenseDetail;
}

export type IndexedLicense = ILicense & {
  tag: string[];
  popularity: number;
  keyword: string[];
};

const licIndex = new Document<IndexedLicense>({
  optimize: true,
  tokenize: 'reverse',
  document: {
    id: 'licenseId',
    tag: 'tag',
    index: [
      {
        field: 'name',
        resolution: 9,
        tokenize: 'reverse',
      },
      {
        field: 'seeAlso[]',
        resolution: 8,
        tokenize: 'reverse',
      },
      {
        field: 'keyword[]',
        resolution: 5,
        tokenize: 'full',
      },
    ],
  },
});

export const wellKnownLicenses: Record<string, number> = {
  MIT: 10000,
  'Apache-2.0': 9900,
  ISC: 9800,
  'GPL-3.0-only': 9700,
  'AGPL-3.0-only': 9600,
  'LGPL-3.0-only': 9500,
  'MPL-2.0': 9400,
  Unlicense: 9300,
  WTFPL: 9200,
  'GPL-2.0-only': 9100,
  'LGPL-2.1-only': 9000,
  'BSD-4-Clause': 8800,
  'BSD-3-Clause': 8700,
  'BSD-3-Clause-Clear': 8600,
  'BSD-2-Clause': 8500,
  'BSD-2-Clause-Patent': 8400,
  '0BSD': 8300,
  'BSL-1.0': 8200,
  'Artistic-2.0': 8100,
  'LPPL-1.3c': 8000,
  'MS-PL': 7800,
  'MS-RL': 7700,
  'MulanPSL-2.0': 7600,
  NCSA: 7500,
  'ODbL-1.0': 7400,
  'OSL-3.0': 7300,
  PostgreSQL: 7200,
  'UPL-1.0': 7100,
  Vim: 7000,
  Zlib: 6900,
  'CECILL-2.1': 6800,
  'CERN-OHL-P-2.0': 6700,
  'CERN-OHL-S-2.0': 6600,
  'CERN-OHL-W-2.0': 6500,
  'ECL-2.0': 6400,
  'EPL-2.0': 6300,
  'EPL-1.0': 6200,
  'EUPL-1.1': 6100,
  'EUPL-1.2': 6000,
  'OFL-1.1': 5900,
  'CC-BY-4.0': 5800,
  'CC-BY-SA-4.0': 5700,
  'CC0-1.0': 5600,
  'BlueOak-1.0.0': 5500,
  'AFL-3.0': 5400,
};

export enum TAGS {
  WELLKNOWN = 'WellKnown',
  OSI = 'OSI',
  FSF = 'FSF',
  DEPRECATED = 'Deprecated',
  AVAILABLE = 'Available',
  CC = 'CC',
  DOC = 'Documentation',
  FONTS = 'Fonts',
  HARDWARE = 'Hardware',
}

const tagMap: Record<string, [string, number]> = {
  'Creative Commons': [TAGS.CC, 40],
  Documentation: [TAGS.DOC, 30],
  Font: [TAGS.FONTS, 20],
  Hardware: [TAGS.HARDWARE, 10],
};

function indexedLicences(orginData: ILicense[]) {
  licenses = [];
  for (let i = 0; i < orginData.length; i++) {
    const lic = orginData[i];
    const indexedLic: IndexedLicense = {
      ...lic,
      tag: [],
      popularity: 0,
      keyword: [],
    };
    const p = wellKnownLicenses[lic.licenseId];
    if (p) {
      indexedLic.tag.push(TAGS.WELLKNOWN);
      indexedLic.popularity += p;
    }
    if (lic.isOsiApproved) {
      indexedLic.tag.push(TAGS.OSI);
      indexedLic.keyword.push(TAGS.OSI);
      indexedLic.popularity += 50;
    }
    if (lic.isFsfLibre) {
      indexedLic.tag.push(TAGS.FSF);
      indexedLic.keyword.push(TAGS.FSF);
      indexedLic.popularity += 41;
    }
    const [, tag] =
      lic.name.match(/(Creative Commons|Font|Documentation|Hardware)/i) || [];
    if (tag && tagMap[tag]) {
      const [t, p] = tagMap[tag];
      indexedLic.tag.push(t);
      indexedLic.keyword.push(t);
      indexedLic.popularity += p;
    }
    const regex = /v?([\d]\.[\d])(\+)?/i;
    const [, version, plus] = lic.licenseId.match(regex) || [];
    indexedLic.keyword.unshift(lic.licenseId.replace('-', ''));
    if (version) {
      const v = +version;
      if (!isNaN(v)) {
        indexedLic.popularity += v * 1;
        if (plus) {
          indexedLic.popularity += 0.1;
        }
      }
    }
    if (lic.isDeprecatedLicenseId) {
      indexedLic.tag.push(TAGS.DEPRECATED);
      indexedLic.popularity = 0;
    } else {
      indexedLic.tag.push(TAGS.AVAILABLE);
    }
    licIndex.add(i, indexedLic);
    licenses.push(indexedLic);
  }
  return licIndex;
}

function transformSearchResult(results: SimpleDocumentSearchResultSetUnit[]) {
  const set = new Set<IndexedLicense>();
  results.forEach(({ result }) => {
    result.forEach((id) => {
      set.add(licenses![id as number]);
    });
  });
  return [...set].sort((a, b) => b.popularity - a.popularity);
}

interface SearchOptions {
  field?: string[];
  limit?: number;
  tags?: TAGS[];
  append?: boolean;
  bool?: 'and' | 'or';
}

function search(
  query = '',
  { limit, field, tags, append, bool }: SearchOptions = {
    limit: 50,
    append: true,
    bool: 'or',
  },
) {
  let tag: TAGS[] = [TAGS.AVAILABLE];
  const index = field ?? ['name', 'seeAlso[]', 'keyword[]'];
  if (tags) {
    if (append) {
      tag.push(...tags);
    } else {
      tag = tags;
    }
  }
  if (query) {
    return transformSearchResult(
      licIndex.search(query, limit, {
        tag,
        bool,
        index,
      }),
    );
  }
  return transformSearchResult(
    licIndex.search({
      tag,
      bool,
      limit,
      index,
    }),
  );
}

export interface GetLicencesOptions extends SearchOptions {
  remote?: boolean;
}

export async function getLicences(
  keyword?: string,
  { remote, ...searchOptions }: GetLicencesOptions = { remote: false },
) {
  if (licenses) {
    return search(keyword, searchOptions);
  }
  const licencesFilePath = !remote
    ? path.join(dataPath, './licenses.json')
    : '';
  let orginData: ILicense[];
  if (!licencesFilePath) {
    orginData = (await getRemoteLicenses()).licenses;
  } else {
    const file = await readFile(licencesFilePath, { encoding: 'utf-8' });
    orginData = JSON.parse(file).licenses as ILicense[];
  }
  indexedLicences(orginData);
  return search(keyword, searchOptions);
}

function git(...args: string[]) {
  return new Promise<string>((resolve, reject) => {
    const result = spawnSync('git', args, {
      windowsHide: true,
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024,
    });
    if (result.status !== 0) {
      reject(result.error);
    } else {
      resolve(result.stdout.trim());
    }
  });
}

export async function getGitInfo() {
  const [author, email] = await Promise.all([
    git('config', 'user.name'),
    git('config', 'user.email'),
  ]);
  return { author, email };
}
