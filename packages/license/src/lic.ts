import path, { basename } from 'node:path';
import { writeFile } from 'node:fs/promises';
import process from 'node:process';
import { Args, Command, Flags } from '@oclif/core';
import figures from '@inquirer/figures';
import { type SelectProps, select } from 'inquirer-select-pro';
import input from '@inquirer/input';
import ora from 'ora';
import chalk from 'chalk';
import {
  type GetLicencesOptions,
  type IndexedLicense,
  TAGS,
  getGitInfo,
  getLicences,
  getRemoteDetailLicense,
} from './api';
import { LicenseProcessor } from './processor';

const CWD = process.cwd();

function renderTag(tag: TAGS) {
  switch (tag) {
    case TAGS.OSI:
      return chalk.green(`${figures.bullet} ${tag}`);
    case TAGS.FSF:
      return chalk.blue(`${figures.bullet} ${tag}`);
    case TAGS.CC:
      return chalk.magenta(`${figures.bullet} ${tag}`);
    case TAGS.DOC:
      return chalk.cyan(`${figures.bullet} ${tag}`);
    case TAGS.HARDWARE:
      return `${chalk.yellow(`⚙️ ${tag}`)}`;
    case TAGS.DEPRECATED:
      return chalk.red(`${figures.bullet} ${tag}`);
    default:
      return '';
  }
}

function renderLicenseOption(license: IndexedLicense) {
  let name = `${license.name} (${license.licenseId})`;
  if (license.tag) {
    name += ` ${license.tag
      .filter((tag) => tag !== TAGS.WELLKNOWN && tag !== TAGS.AVAILABLE)
      .map((t) => renderTag(t as TAGS))
      .join(' ')}`;
  }
  // name += ` ${license.popularity}`;
  return name;
}

export class License extends Command {
  static hidden = false;
  static description = 'Generate license file.';
  static examples = [
    {
      command: '<%= config.bin %>',
      description: 'Select your license file.',
    },
    {
      command: '<%= config.bin %> -i',
      description:
        'If you dont know which license you should choose, you can use this command to help you choose',
    },
  ];
  static aliases = ['license'];
  static args = {
    license: Args.string(),
  };
  static flags = {
    file: Flags.file({
      char: 'f',
      default: './LICENSE',
    }),
    pageSize: Flags.integer({
      char: 'p',
      default: 10,
    }),
    tags: Flags.option({
      multiple: true,
      char: 't',
      options: [
        TAGS.WELLKNOWN,
        TAGS.OSI,
        TAGS.FSF,
        TAGS.CC,
        TAGS.DOC,
        TAGS.FONTS,
        TAGS.HARDWARE,
        TAGS.DEPRECATED,
      ] as const,
    })(),
  };
  async run() {
    const { args, flags } = await this.parse(License);
    let targetLicense: IndexedLicense | null = null;
    const { pageSize, tags } = flags;

    const selectProps: Omit<
      SelectProps<IndexedLicense, false>,
      'message' | 'options'
    > = {
      multiple: false,
      pageSize,
      equals: (a, b) => a.licenseId === b.licenseId,
      theme: {
        style: {
          placeholder: () =>
            chalk.dim(
              `Type to search all ${tags ? `<${tags}>` : 'SPDX'} licenses`,
            ),
        },
      },
    };

    if (args.license) {
      const spinner = ora({ text: 'Verifying...' }).start();
      const licenses = await getLicences(args.license, {
        tags: tags ?? [TAGS.WELLKNOWN],
        field: ['name', 'keyword[]'],
      });
      spinner.text = 'Verified';
      spinner.succeed().stop();

      if (licenses.length === 1) {
        targetLicense = licenses[0];
      } else if (licenses.length > 1) {
        targetLicense = await select({
          ...selectProps,
          message: 'Which license are you referring to?',
          options: licenses.map((lic) => ({
            name: renderLicenseOption(lic),
            value: lic,
          })),
        });
      }
    }
    if (!targetLicense) {
      targetLicense = await select({
        ...selectProps,
        instructions: ({ behaviors, theme }) => {
          if (!behaviors.filter) {
            let i = ' (The licenses filtered by ';
            if (args.license) {
              i += `"${args.license}"`;
            }
            if (tags) {
              i += `<${tags}>`;
            }
            if (args.license || tags) {
              return `${i} is as follows, press ${theme.style.key('enter')} to generate)`;
            }
            return ` (Common licenses are listed below, press ${theme.style.key('enter')} to generate)`;
          }
          return '';
        },
        message: 'Choose the license you want:',
        options: async (keyword) => {
          let kw = keyword;
          if (!keyword && args.license) {
            kw = args.license;
          }
          const options: GetLicencesOptions = {};
          if (tags) {
            options.tags = tags;
            options.bool = 'or';
          }
          if (!kw) {
            options.tags ??= [TAGS.WELLKNOWN];
            options.bool = 'or';
          } else {
            options.bool = 'or';
          }
          return (await getLicences(kw, options)).map((lic) => ({
            name: renderLicenseOption(lic),
            value: lic,
          }));
        },
      });
    }
    if (targetLicense) {
      const filePath = path.isAbsolute(flags.file)
        ? flags.file
        : path.resolve(CWD, flags.file);
      const fileName = basename(filePath);

      const spinner = ora({
        text: `Get details of the license "${targetLicense.licenseId}"...`,
      }).start();

      const { licenseText } = await getRemoteDetailLicense(
        targetLicense.detailsUrl,
      );

      spinner.succeed(
        `Details of the license "${targetLicense.licenseId}" are obtained.`,
      );

      const renderArgs: Record<string, string> = await getGitInfo();
      renderArgs.fromYear = new Date().getFullYear().toString();
      const processor = new LicenseProcessor(licenseText);
      const unknownArgs = processor.getUnknownArgs();
      if (unknownArgs && !unknownArgs.replaceAll) {
        const infos = unknownArgs.placeholders;
        for (const placeholder of Object.keys(infos)) {
          const answer = await input({
            message: `License template requires parameter <${placeholder}>: `,
          });
          if (answer) {
            renderArgs[placeholder] = answer;
          }
        }
      }

      spinner.text = `Generating \`${fileName}\``;
      spinner.start();

      const license = processor.render(renderArgs);
      try {
        await writeFile(filePath, license, { encoding: 'utf-8' });
        spinner.succeed(
          `License file of "${targetLicense.licenseId}" is generated at: ${filePath}`,
        );
      } catch (error) {
        spinner.fail(`Failed to generate \`${fileName}\` file.`);
        throw error;
      }
    }
  }
}
