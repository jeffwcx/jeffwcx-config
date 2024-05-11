import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { Args, Command, Flags } from '@oclif/core';
import ora, { type Ora } from 'ora';
import Fuse from 'fuse.js';
import { type SelectOption, select } from 'inquirer-select-pro';
import { generateGitignore, getTemplates } from './api';

const CWD = process.cwd();

export class Gitignore extends Command {
  static hidden = false;
  static description = 'Generate `.gitignore` file.';
  static examples = [
    {
      command: '<%= config.bin %>',
      description: 'Generate `.gitignore` through interactive selection',
    },
    {
      command: '<%= config.bin %> macos,windows,linux,node',
      description:
        'Generate the `.gitignore` file in the current directory that adapt to macOS, Windows, Linux, and Node.js environments',
    },
  ];
  static aliases = ['gitignore'];
  static args = {
    envNames: Args.string(),
  };
  static flags = {
    file: Flags.file({
      exists: true,
      char: 'f',
      default: './.gitignore',
    }),
  };
  async run() {
    const { args, flags } = await this.parse(Gitignore);
    const envNames = args.envNames;
    let envNameList: string[] = [];
    let spinner: Ora | undefined;
    if (!envNames) {
      // Enter selection mode
      spinner = ora({
        text: 'Getting list of OS/IDEs/PLs...',
      }).start();
      let options: SelectOption<string>[];
      let fuse: Fuse<SelectOption<string>> | undefined;
      try {
        spinner.stop();
        envNameList = await select({
          message: 'Choose your OS, IDE, PL, etc.',
          required: true,
          clearInputWhenSelected: true,
          options: async (input = '') => {
            if (!options) {
              try {
                const templates = await getTemplates();
                options = templates.map((t) => ({ name: t, value: t }));
              } catch (error) {
                throw new Error('Failed to get OS/IDEs/PLs list');
              }
              fuse = new Fuse(options, {
                keys: ['value'],
                includeScore: true,
              });
            }
            if (!input) return options;
            if (fuse) {
              const result = fuse.search(input).map(({ item }) => item);
              return result;
            }
            return [];
          },
        });
      } catch (error) {
        spinner.fail((error as Error).message);
        this.exit(1);
      }
    } else {
      envNameList = envNames.split(/[\s,&]+/);
    }
    const text = 'Generating `.gitignore`';
    if (!spinner) {
      spinner = ora(text).start();
    } else {
      spinner.text = text;
      spinner.start();
    }
    try {
      const fileContext = await generateGitignore(envNameList.join(','));
      const filePath = path.isAbsolute(flags.file)
        ? flags.file
        : path.resolve(CWD, flags.file);
      await writeFile(filePath, fileContext, { encoding: 'utf-8' });
      spinner.succeed(`\`.gitignore\` file is generated at: ${filePath}`);
    } catch (error) {
      spinner.fail('Failed to generate `.gitignore` file.');
      throw error;
    }
  }
}
