import '@/utils/helper';

import inquirer from 'inquirer';
import inquirerAutocompletePrompt from 'inquirer-autocomplete-prompt';
import { getTemplateSource, SourceInfo, REPOSITORY_TYPE } from './Source';
import { getConfig } from './Config';

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

export interface RepoOptions {
  name: string;
  type: REPOSITORY_TYPE[keyof REPOSITORY_TYPE];
  repository: string;
}

export const getRepoOptions = async (
  options: {
    needType?: boolean;
    needRepository?: boolean;
    needSelectName?: boolean;
  } = {},
): Promise<RepoOptions> => {
  const {
    needType = true,
    needRepository = true,
    needSelectName = true,
  } = options;

  const answer = await inquirer.prompt<RepoOptions>([
    {
      name: 'name',
      message: `${needSelectName ? 'Select' : 'Input'} repo name`,
      type: needSelectName ? 'autocomplete' : 'input',
      source: async (ans, input) => {
        const list = Object.values(getConfig().getSource()).map((r) => r.name);
        return input ? list.filter((r) => r.includes(input)) : list;
      },
      validate: (input) => {
        return input ? true : 'Required';
      },
    },
    {
      name: 'type',
      type: 'list',
      when: needType,
      choices: Object.values(REPOSITORY_TYPE),
      default: (ans: RepoOptions) => {
        const source = getConfig().getSource();
        return source[ans.name] ? source[ans.name].type : undefined;
      },
    },
    {
      name: 'repository',
      type: 'input',
      when: needRepository,
      default: (ans: RepoOptions) => {
        const source = getConfig().getSource();
        return source[ans.name] ? source[ans.name].repository : undefined;
      },
      validate: (input) => {
        return input ? true : 'Required';
      },
    },
  ]);

  return answer;
};
