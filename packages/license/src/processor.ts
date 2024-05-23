export interface RequiredArgs {
  fromYear: string;
  author: string;
  email: string;
  toYear?: string;
  // SOFTWARE NAME, Asset Name, name of library
  project?: string;
  // company
  company?: string;
}

type Info = {
  start: number;
  end: number;
  placeholder: string;
  line: number;
};

const placeholderMap: Record<string, string> = {
  year: 'fromYear',
  dates: 'fromYear',
  author: 'author',
  owner: 'author',
  holder: 'author',
  email: 'email',
  software: 'project',
  library: 'project',
};

/**
 * License Render, Relatively limited
 *
 * @example
 * ```ts
 * const processor = new LicenseProcessor('Copyright (c) <year> <copyright holders>');
 * const args = processor.getUnknownArgs();
 * if (!args) {
 *   processor.render({ year: '2024', author: 'jeffwcx' });
 * }
 * ```
 * @example
 * ```ts
 * const processor = new LicenseProcessor('Copyright (c) 1999-2002 Zend Technologies Ltd. All rights reserved.');
 * const args = processor.getUnknownArgs();
 * if (args.replaceAll) {
 *   let replacement = '2024-present your company ltd.';
 *   process.render({ replaceAll: replacement });
 *   // Copyright (c) 2024-present your company ltd. All rights reserved.
 * }
 * ```
 */
export class LicenseProcessor<
  Args extends RequiredArgs = RequiredArgs,
  ExtraArgs extends object = object,
> {
  private placeholders = new Map<keyof Args | keyof ExtraArgs, Info[]>();
  private unknownPlaceholder = new Map<string, Info[]>();
  private replaceAllPlaceholder: Info | null = null;
  // only available after copyright
  private prefixPlaceholder: Info | null = null;
  private removedPlaceholder: Info[] = [];
  private knownArgs: (keyof Args | keyof ExtraArgs)[] = [
    'fromYear',
    'author',
    'email',
    'toYear',
    'project',
    'company',
  ];
  constructor(
    private template: string,
    extraKnownArgs?: (keyof ExtraArgs)[],
  ) {
    if (extraKnownArgs) {
      this.knownArgs.push(...extraKnownArgs);
    }
    this.analysis();
  }

  private setPlaceholder(
    ph: keyof Args | keyof ExtraArgs,
    info: Omit<Info, 'placeholder'>,
  ) {
    if (!this.placeholders.has(ph)) {
      this.placeholders.set(ph, []);
    }
    const result: Info = { ...info, placeholder: ph as string };
    // There are no same placeholders in the same line
    if (this.validPlaceholder(ph, result)) {
      this.placeholders.get(ph)?.push(result);
    } else {
      this.placeholders.set(ph, [result]);
    }
  }

  private setUnknownPlaceholder(
    placeholder: string,
    info: Omit<Info, 'placeholder'>,
  ) {
    if (!this.unknownPlaceholder.has(placeholder)) {
      this.unknownPlaceholder.set(placeholder, []);
    }
    const result: Info = { ...info, placeholder };
    this.unknownPlaceholder.get(placeholder)?.push(result);
  }

  private validPlaceholder(ph: keyof Args | keyof ExtraArgs, info: Info) {
    const infos = this.placeholders.get(ph);
    return !infos?.some((i) => i.line === info.line);
  }

  private storeKnownPlaceholder(
    keyword: string,
    info: Info,
    parens = true,
  ): boolean {
    keyword = keyword.trim().toLowerCase();
    if (keyword === 'name') {
      this.setPlaceholder('author', info);
      return true;
    } else if (this.knownArgs.includes(keyword as keyof ExtraArgs)) {
      this.setPlaceholder(keyword as keyof ExtraArgs, info);
      return true;
    }
    if (parens) {
      const reg = /[\dyx]{4}/g;
      let match;
      let hasMatch = false;
      let fromInfo: Info | null = null;
      while ((match = reg.exec(keyword))) {
        if (!this.validPlaceholder('fromYear', info)) {
          if (!fromInfo) {
            this.setPlaceholder('toYear', info);
          } else {
            this.setPlaceholder('fromYear', fromInfo);
            this.setPlaceholder('toYear', {
              start: info.start + 1 + match.index,
              end: info.end,
              line: info.line,
            });
          }
          hasMatch = true;
          break;
        }
        fromInfo = {
          start: info.start,
          end: info.start + match.index + match[0].length,
          line: info.line,
          placeholder: 'fromYear',
        };
        this.setPlaceholder('fromYear', info);
        hasMatch = true;
      }
      if (hasMatch) {
        return true;
      }
    }
    const [, placeholder] =
      keyword.match(
        /(year|dates|owner|author|holder|email|software|library)(?!\s*organization)/i,
      ) || [];
    if (placeholder) {
      const ph = placeholder.toLowerCase();
      let knownArg = placeholderMap[ph] as keyof Args;
      if (!knownArg) return false;
      if (knownArg === 'fromYear') {
        if (!this.validPlaceholder('fromYear', info)) {
          knownArg = 'toYear';
        }
      } else if (knownArg === 'author') {
        if (this.prefixPlaceholder) {
          if (parens) {
            this.prefixPlaceholder = null;
          } else if (
            this.prefixPlaceholder.placeholder?.toLowerCase() === 'copyright'
          ) {
            info.start = this.prefixPlaceholder.start;
          }
        }
      }
      this.setPlaceholder(knownArg, info);
      return true;
    }
    return false;
  }

  isPL(char: string) {
    return char === '<' || char === '[' || char === '(';
  }
  isPR(char: string) {
    return char === '>' || char === ']' || char === ')';
  }
  isIgnore(char: string) {
    return char === '"' || char === '“';
  }

  private analysis() {
    let keyword = '';
    let afterCopyright = false;
    let afterCopyrightC = false;
    let start = -1;
    let i = 0;
    let depth = 0;
    let line = 0;
    while (i < this.template.length) {
      const char = this.template[i];
      if (depth > 0 && this.isIgnore(char)) {
        start = -1;
        keyword = '';
        depth--;
      } else if (this.isPL(char)) {
        // ignore
        if (depth === 0 && this.isIgnore(keyword)) {
          keyword += char;
          i++;
          continue;
        }
        depth += 1;
        if (depth <= 1) {
          start = i;
          keyword = '';
        } else {
          keyword += char;
        }
      } else if (depth > 0 && this.isPR(char)) {
        if (depth >= 2) {
          keyword += char;
        } else if (depth >= 1) {
          const kw = keyword.trim();
          if (kw.match(/copy(left|right)\s+(attitude|notice|information)/i)) {
            this.replaceAllPlaceholder = {
              start,
              end: i,
              line,
              placeholder: kw,
            };
            depth = 0;
            break;
          } else if (kw.toLowerCase() === 'c') {
            start = -1;
            keyword = '';
            afterCopyrightC = true;
          } else {
            const info = { start, end: i, line, placeholder: kw };
            const known = this.storeKnownPlaceholder(keyword, info);
            if (!known && char !== ')') {
              this.setUnknownPlaceholder(kw, info);
            }
            start = -1;
            keyword = '';
          }
        }
        depth--;
      } else if (char === '\n') {
        const kw = keyword.trim();
        if (afterCopyright && kw) {
          const info: Info = { start, end: i - 1, line, placeholder: kw };
          this.storeKnownPlaceholder(keyword, info, false);
        }
        keyword = '';
        afterCopyright = false;
        afterCopyrightC = false;
        start = -1;
        line++;
      } else {
        const isBlank = !!char.match(/\s/);
        const kw = keyword.trim().toLowerCase();
        if (depth >= 1) {
          keyword += char;
          i++;
          continue;
        }
        if (isBlank) {
          if (!kw) {
            start = i + 1;
          } else if (kw === '©') {
            keyword = '';
            start = i + 1;
            afterCopyrightC = true;
          } else {
            if (afterCopyrightC) {
              // only afterCopyright C is true, storeKnownPlaceholder will be called
              const info = { start, end: i - 1, line, placeholder: kw };
              const known = this.storeKnownPlaceholder(keyword, info, false);
              if (!known) {
                this.prefixPlaceholder = info;
              }
            }
            if (!afterCopyright && kw === 'copyright') {
              afterCopyright = true;
            }
            keyword = '';
            start = i + 1;
          }
        } else {
          keyword += char;
        }
      }
      i++;
    }
    const kw = keyword.trim();
    if (kw && afterCopyright) {
      const info = { start, end: i - 1, line, placeholder: kw };
      const known = this.storeKnownPlaceholder(keyword, info, false);
      if (!known) {
        this.setUnknownPlaceholder(kw, info);
      }
    }
  }
  getUnknownArgs() {
    const { replaceAllPlaceholder: replaceAll, unknownPlaceholder } = this;
    if (replaceAll) {
      return { replaceAll };
    }
    if (unknownPlaceholder.size > 0) {
      return {
        placeholders: Object.fromEntries(unknownPlaceholder),
      };
    }
    return null;
  }
  render(args: (Args & ExtraArgs) | any) {
    const {
      replaceAllPlaceholder: replaceAll,
      placeholders,
      unknownPlaceholder,
    } = this;
    const infos: { info: Info; removed: boolean; replaceAll?: boolean }[] = [];
    if (replaceAll) {
      infos.push({
        info: replaceAll,
        removed: false,
        replaceAll: true,
      });
    } else {
      for (const [, phs] of placeholders) {
        phs.reduce((acc, info) => {
          acc.push({
            info,
            removed: false,
          });
          return acc;
        }, infos);
      }
      for (const [, phs] of unknownPlaceholder) {
        phs.reduce((acc, info) => {
          acc.push({
            info,
            removed: false,
          });
          return acc;
        }, infos);
      }
      this.removedPlaceholder.forEach((info) => {
        infos.push({ info, removed: true });
      });
    }
    let i = 0;
    let result = '';
    infos
      .sort((a, b) => a.info.start - b.info.start)
      .forEach(({ info, removed, replaceAll }) => {
        const { start, end, placeholder } = info;
        if (removed) {
          result += this.template.slice(i, start);
          i = info.end + 1;
          return;
        }
        result += this.template.slice(i, start);
        const arg = replaceAll
          ? `Copyright (c) ${args.fromYear} ${args.author}`
          : placeholder === 'toYear'
            ? args[placeholder] || 'present'
            : placeholder
              ? args[placeholder as keyof Args]
              : '';
        if (arg) {
          result += arg;
        } else {
          result += this.template.slice(start, end + 1);
        }
        i = end + 1;
      });
    result += this.template.slice(i);
    return result;
  }
}
