import '@/utils/helper';

import { fileURLToPath } from 'url';

const __path_src_root = path.dirname(fileURLToPath(import.meta.url));
const __path_cache = path.resolve(
  __path_src_root,
  '../node_modules/.cache/@setup',
);
fs.ensureDir(__path_cache);
const __path_cache_git = path.resolve(__path_cache, './__git_cache__');
fs.ensureDir(__path_cache_git);
const __path_cache_generator = path.resolve(
  __path_cache,
  './__generator_cache__',
);
fs.ensureDir(__path_cache_generator);

export const useEnvVar = () => ({
  __path_src_root,
  __path_cache,
  __path_cache_git,
  __path_cache_generator,
});

export const useEnvVarCurrent = (url: string) => {
  return {
    __filename: fileURLToPath(url),
    __dirname: path.dirname(fileURLToPath(url)),
  };
};

export const getNameByPathnameAndType = ({
  pathname,
  type,
}: {
  pathname: string;
  type: string;
}) => new RegExp(`.*${type}-(.*)`).exec(pathname)?.[1];

export type OmitFirst<T extends unknown[]> = T extends [unknown, ...infer R]
  ? R
  : never;

export type AsyncOrCommon<T> = Promise<T> | T;
