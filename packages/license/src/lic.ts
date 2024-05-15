import { Args, Command, Flags } from '@oclif/core';
import figures from '@inquirer/figures';
import { select } from 'inquirer-select-pro';
import ora, { oraPromise } from 'ora';
import chalk from 'chalk';
import {
  type GetLicencesOptions,
  type IndexedLicense,
  TAGS,
  getLicences,
} from './api';

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
  let name = `${license.name}(${license.licenseId})`;
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
      exists: true,
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
    let targetLicense: string | null = null;
    const { pageSize, tags } = flags;
    if (args.license) {
      const spinner = ora({ text: 'Verifying...' }).start();
      const licenses = await getLicences(args.license, {
        tags: tags ?? [TAGS.WELLKNOWN],
      });
      spinner.text = 'Verified';
      spinner.succeed().stop();

      if (licenses.length === 1) {
        targetLicense = licenses[0].licenseId;
      } else if (licenses.length > 1) {
        targetLicense = await select({
          multiple: false,
          message: 'Which license are you referring to?',
          pageSize,
          options: licenses.map((lic) => ({
            name: renderLicenseOption(lic),
            value: lic.licenseId,
          })),
        });
      }
    }
    if (!targetLicense) {
      targetLicense = await select({
        multiple: false,
        pageSize,
        filter: !args.license,
        message:
          'Commonly used open source licenses are listed here, please choose:',
        options: async (keyword = args.license) => {
          const options: GetLicencesOptions = {};
          if (tags) {
            options.tags = tags;
            options.bool = 'or';
          } else if (!keyword) {
            options.tags = [TAGS.WELLKNOWN];
            options.bool = 'or';
          } else {
            options.tags = [TAGS.AVAILABLE];
          }
          return (await getLicences(keyword, options)).map((lic) => ({
            name: renderLicenseOption(lic),
            value: lic.licenseId,
          }));
        },
      });
    }
    this.log(targetLicense || '');
  }
}
