import { TemplateSource } from '@/Source';
import path from 'path';
import { fileURLToPath } from 'url';

export const getPathnameMapByNameAndExtList = (
  nameList: string[],
  extList: string[],
  dir: string,
) => {
  const map = {};
  extList.forEach((ext) => {
    nameList.forEach((name) => {
      map[
        `${name}${
          ext ? ext.substring(0, 1).toUpperCase().concat(ext.substring(1)) : ''
        }`
      ] = path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        `./assets/${dir}`,
        `./${name}${ext ? `.${ext}` : ''}`,
      );
    });
  });
  return map;
};

export const getTestTemplateSource = async (name = 'default') =>
  await TemplateSource.build({
    repositoryList: [
      {
        name,
        repository: path.resolve(__dirname, './assets/source'),
        type: 'local',
      },
      {
        name: `${name}-remote`,
        repository: 'https://github.com/NoraH1to/setup-template-test.git',
        type: 'git',
      },
    ],
  });

export const templateSourcePathnameMap = getPathnameMapByNameAndExtList(
  [
    'base-has-meta',
    'base-has-not-meta',
    'inject-has-hook',
    'inject-has-not-hook',
  ],
  [''],
  'source',
);
