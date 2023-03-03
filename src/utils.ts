import '@/utils/helper';

import { SOURCE_TYPE } from '@/Source';
import { fileURLToPath } from 'url';
import { homedir } from 'os';

const __dir_home = homedir();
const __dir_cache = path.resolve(__dir_home, './.cache/@setup');
fs.ensureDir(__dir_cache);
const __dir_cache_git = path.resolve(__dir_cache, './__git_cache__');
fs.ensureDir(__dir_cache_git);
const __dir_cache_generator = path.resolve(
  __dir_cache,
  './__generator_cache__',
);
fs.ensureDir(__dir_cache_generator);
const __dir_cache_test = path.resolve(__dir_cache, './__test_cache__');
fs.ensureDir(__dir_cache_test);

export const useEnvVar = () => ({
  __dir_cache,
  __dir_cache_git,
  __dir_cache_generator,
  __dir_cache_test,
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

export function isDir(pathname: string) {
  const f = fs.statSync(pathname);
  return (
    f.isDirectory() ||
    (f.isSymbolicLink() && fs.statSync(fs.readlinkSync(pathname)).isDirectory())
  );
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
