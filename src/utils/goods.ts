import * as globbyModule from 'globby';
export { default as YAML } from 'yaml';
export { default as chalk } from 'chalk';
export { default as fs } from 'fs-extra';
export { default as path } from 'node:path';
export { default as os } from 'node:os';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const globby: typeof globbyModule.globby & typeof globbyModule =
  Object.assign(function globby(patterns, options) {
    return globbyModule.globby(patterns, options);
  }, globbyModule);
