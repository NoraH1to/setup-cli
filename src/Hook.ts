import 'zx/globals';

import * as zx from 'zx';
import inquirer from 'inquirer';
import normalizePath from 'normalize-path';
import ora from 'ora';
import url from 'url';

import type { FileInfo } from './File';
import type { SourceInfo } from './Source';
import type { AsyncOrCommon } from './utils';

export type HookHelpers = typeof zx & {
  inquirer: typeof inquirer;
  normalizePath: typeof normalizePath;
  ora: typeof ora;
};

export interface HookBase<P extends unknown[] = unknown[], R = unknown> {
  (...args: P): AsyncOrCommon<R>;
}
export interface Hooks {
  onMerge: HookBase<
    [
      options: {
        src: FileInfo;
        dest: FileInfo;
      },
    ],
    string
  >;
  beforeGenerate?: HookBase;
  afterGenerate?: HookBase;
}

interface HookConstructorOptions {
  name: string;
  hooks: Hook['hookMap'];
}

interface HookBuildOptions {
  source: SourceInfo;
  hookHelper: HookHelper;
}

export type InjectHook = (options: { hookHelper: HookHelper }) => Hooks;

export class Hook {
  public static readonly defaultHookMap: Hooks = {
    onMerge: ({ src }) => {
      return src.getContent();
    },
  };

  public readonly name: string;

  public readonly hookMap: Hooks = { ...Hook.defaultHookMap };

  public static async build({ source, hookHelper }: HookBuildOptions) {
    let targetHooks;
    try {
      const module = (
        await import(
          url
            .pathToFileURL(path.resolve(source.pathname, 'hook/index.js'))
            .toString()
        )
      )?.default as InjectHook;
      targetHooks = module?.({ hookHelper }) ?? {};
    } catch (e) {
      targetHooks = {};
    }
    const hooks = { ...Hook.defaultHookMap, ...targetHooks };
    return new Hook({ name: source.name, hooks });
  }

  public async callHook<N extends keyof Hooks>(
    hookName: N,
    ...args: Parameters<Hooks[N]>
  ): Promise<ReturnType<Hooks[N]>> {
    return await this.hookMap[hookName]?.apply(null, args);
  }

  /**
   * @deprecated use `Hook.build` instead
   */
  constructor({ name, hooks }: HookConstructorOptions) {
    this.name = name;
    this.hookMap = { ...this.hookMap, ...hooks };
  }
}

export class HookHelper {
  public readonly helpers: HookHelpers;
  public readonly env: {
    __path_project_root__: string;
  };
  constructor(options: { target: SourceInfo }) {
    this.helpers = {
      ...zx,
      inquirer,
      normalizePath,
      ora: ora,
    };
    this.env = {
      __path_project_root__: options.target.pathname,
    };
  }
}
