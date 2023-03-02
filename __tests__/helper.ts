import { TemplateSource } from '@/Source';
import path from 'path';
import { fileURLToPath } from 'url';
import { useEnvVar } from '@/utils';
import { nanoid } from 'nanoid';
import { beforeAll, afterAll } from 'vitest';

const { __dir_cache_test } = useEnvVar();

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

export const getTempCacheDirFn = (pathname: string) => (ensure?: boolean) => {
  const target = path.join(__dir_cache_test, pathname, nanoid());
  ensure && fs.ensureDirSync(target);
  return target;
};

export const clearCacheDir = (pathname?: string) => {
  pathname = path.join(__dir_cache_test, pathname);
  try {
    fs.readdirSync(pathname).forEach((name) =>
      fs.rmSync(path.join(pathname, name), { recursive: true }),
    );
  } catch {
    /* empty */
  }
};

export const autoClearCacheDir = (pathname?: string) => {
  beforeAll(() => clearCacheDir(pathname));
  afterAll(() => clearCacheDir(pathname));
};
