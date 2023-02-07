import 'zx/globals';

import url from 'url';

import type { FileInfo } from './File';

export interface Hooks {
  onMerge: (options: { src: FileInfo; dest: FileInfo }) => string;
  [key: string]: (...unknown) => unknown;
}

interface HookConstructorOptions {
  name: string;
  hooks: Hook['hookMap'];
}

interface HookBuildOptions {
  name: string;
  pathname: string;
}

export class Hook {
  public static readonly defaultHookMap: Hooks = {
    onMerge: ({ src }) => {
      return src.getContent();
    },
  };

  public readonly name: string;

  public readonly hookMap: Hooks = { ...Hook.defaultHookMap };

  public static async build({ pathname, name }: HookBuildOptions) {
    let targetHooks;
    try {
      targetHooks =
        (
          await import(
            url.pathToFileURL(path.resolve(pathname, 'hook/index.js')).toString()
          )
        )?.default?.() ?? {};
    } catch (e) {
      targetHooks = {};
    }
    const hooks = { ...Hook.defaultHookMap, ...targetHooks };
    return new Hook({ name, hooks });
  }

  /**
   * @deprecated use `Hook.build` instead
   */
  constructor({ name, hooks }: HookConstructorOptions) {
    this.name = name;
    this.hookMap = { ...this.hookMap, ...hooks };
    Object.freeze(this.hookMap);
  }
}
