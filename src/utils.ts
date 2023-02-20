import '@/utils/helper';

import { SOURCE_TYPE } from '@/Source';
import { fileURLToPath } from 'url';

const __path_src_root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  './',
);
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
const __path_cache_test = path.resolve(__path_cache, './__test_cache__');
fs.ensureDir(__path_cache_test);

export const useEnvVar = () => ({
  __path_src_root,
  __path_cache,
  __path_cache_git,
  __path_cache_generator,
  __path_cache_test,
});

export const useEnvVarCurrent = (url: string) => {
  return {
    __filename: fileURLToPath(url),
    __dirname: path.dirname(fileURLToPath(url)),
  };
};

export const getNameByPathnameAndType = (options: {
  pathname: string;
  type: SOURCE_TYPE;
}) => {
  const { pathname, type } = options;
  const res = new RegExp(`.*${type}-(.*)`).exec(pathname)?.[1];
  return res === '' || res === undefined ? null : res;
};

export function hasKeys<T extends object = object>(options: {
  target: T;
  keys: Array<keyof T>;
  onHasNot?: (target: T, key: keyof T) => unknown;
}) {
  const { target, keys, onHasNot } = options;
  for (const key of keys) {
    if (target[key] === undefined) {
      onHasNot?.(target, key);
      return false;
    }
  }
  return true;
}

export type OmitFirst<T extends unknown[]> = T extends [unknown, ...infer R]
  ? R
  : never;

export type AsyncOrCommon<T> = T | Promise<T>;

export type UnionValues<T> = T[keyof T];

export type PartialSomething<T, K extends keyof T> = {
  [R in keyof Omit<T, K>]: T[R];
} & {
  [O in keyof Pick<T, K>]?: T[O];
};
