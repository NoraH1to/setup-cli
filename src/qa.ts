import 'zx/globals';

import inquirer from 'inquirer';
import inquirerAutocompletePrompt from 'inquirer-autocomplete-prompt';
import { getTemplateSource, SourceInfo } from './Source';

inquirer.registerPrompt('autocomplete', inquirerAutocompletePrompt);

export interface CreateOptions {
  project: SourceInfo;
  base: SourceInfo;
  inject: SourceInfo[];
}

export const getCreateOptions = async (): Promise<CreateOptions> => {
  const answer = await inquirer.prompt<CreateOptions>([
    {
      name: 'project',
      message: 'Input project name',
      type: 'input',
      default: 'pkg-name',
    },
    {
      name: 'base',
      message: 'Select base template',
      type: 'autocomplete',
      source: async (ans, input) => {
        const source = (await getTemplateSource()).baseSourceList
          .filter((info) => (input ? info.name.includes(input) : true))
          .map((info) => ({
            name: info.name,
            value: info,
          }));
        if (!source.length)
          source.push({ name: input, value: { name: input, pathname: null } });
        return source;
      },
    },
    {
      name: 'inject',
      message: 'Select what need inject',
      type: 'checkbox',
      choices: async () =>
        (
          await getTemplateSource()
        ).injectSourceList.map((info) => ({
          name: info.name,
          value: info,
        })),
      default: [],
    },
  ]);
  answer.project = {
    name: answer.project as unknown as string,
    pathname: path.resolve(process.cwd(), answer.project as unknown as string),
  };
  return answer;
};
