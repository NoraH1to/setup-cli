import '@/utils/helper';

import ex from '@/utils/helper';
import inquirer from 'inquirer';
import normalizePath from 'normalize-path';
import ora from 'ora';
import { pathToFileURL } from 'url';
import { PATHNAME } from './Source';
import { hasKeys } from './utils';
import VError from 'verror';

import type { FileInfo } from './File';
import type { SourceInfo, SOURCE_TYPE } from './Source';
import type { AsyncOrCommon } from './utils';
import type { DirInfo } from './Dir';

export type HookHelpers = typeof ex & {
  inquirer: typeof inquirer;
  normalizePath: typeof normalizePath;
  ora: typeof ora;
};

export interface HookBase<P extends unknown[] = unknown[], R = unknown> {
  (...args: P): AsyncOrCommon<R>;
}

/**
 * beforeGenerate -> beforeMerge -> onMerging -> afterMerge -> afterGenerate -> afterOutput
 */
export interface Hooks {
  beforeGenerate?: HookBase;
  beforeMerge?: HookBase<
    [
      options: {
        srcDir: DirInfo;
        destDir: DirInfo;
        src: FileInfo;
        dest: FileInfo;
      },
    ]
  >;
  onMerging?: HookBase<
    [
      options: {
        src: FileInfo;
        dest: FileInfo;
      },
    ],
    string
  >;
  afterMerge?: HookBase<
    [
      options: {
        srcDir: DirInfo;
        destDir: DirInfo;
        src: FileInfo;
        dest: FileInfo;
      },
    ]
  >;
  afterGenerate?: HookBase<
    [
      options: {
        targetDir: DirInfo;
      },
    ]
  >;
  afterOutput?: HookBase;
}

interface HookConstructorOptions {
  name: string;
  hooks: Hook['hookMap'];
}

interface HookBuildOptions {
  source: SourceInfo;
  hookHelper: HookHelper;
}

interface HookFn {
  (options: { hookHelper: HookHelper }): Partial<Hooks>;
}
export type BaseHook = HookFn & {
  meta: { __dir_src__: string; __pathname_entry__: string };
};
export type InjectHook = HookFn;

type HookModule<T extends SOURCE_TYPE = 'inject'> = T extends 'inject'
  ? InjectHook
  : BaseHook;

export class Hook {
  public static readonly defaultHookMap: Hooks = {};

  public readonly name: string;

  private hookMap: Hooks;

  /**
   * @deprecated use `Hook.build` instead
   */
  constructor({ name, hooks }: HookConstructorOptions) {
    this.name = name;
    this.hookMap = { ...Hook.defaultHookMap, ...hooks };
  }

  public static async getHookModelByPathname<T extends SOURCE_TYPE = 'inject'>(
    pathname: string,
  ) {
    return (
      await import(
        pathToFileURL(
          path.resolve(pathname, `${PATHNAME.HOOK}/index.js`),
        ).toString()
      )
    )?.default as HookModule<T>;
  }

  public static async build({ source, hookHelper }: HookBuildOptions) {
    let targetHooks: Hooks = {};
    let module;
    if (
      fs.existsSync(path.resolve(source.pathname, `${PATHNAME.HOOK}/index.js`))
    ) {
      try {
        module = await Hook.getHookModelByPathname(source.pathname);
      } catch {
        console.error(
          chalk.yellow(
            `Fail to load hooks from "${this.name}" at ${source.pathname}`,
          ),
        );
        targetHooks = {};
      }
      targetHooks = module?.({ hookHelper }) ?? {};
    }
    return new Hook({ name: source.name, hooks: targetHooks });
  }

  public async callHook<N extends keyof Hooks>(
    hookName: N,
    ...args: Parameters<Hooks[N]>
  ): Promise<ReturnType<Hooks[N]>> {
    if (this.hasHook(hookName))
      return await this.hookMap[hookName].apply?.(null, args);
    else return undefined;
  }

  public hasHook(hookName: keyof Hooks) {
    return !!(
      this.hookMap[hookName] && typeof this.hookMap[hookName] === 'function'
    );
  }

  public getHookMap() {
    return this.hookMap;
  }
}

export class HookHelper {
  public readonly helpers: HookHelpers;
  public readonly env: {
    __dir_target_root__: string;
  } & BaseHook['meta'];
  constructor(options: { target: SourceInfo; baseMeta: BaseHook['meta'] }) {
    const { target, baseMeta } = options;
    this.helpers = {
      ...ex,
      inquirer,
      normalizePath,
      ora: ora,
    };
    this.env = {
      __dir_target_root__: target.pathname,
      ...baseMeta,
    };
  }

  public static async build(options: { target: SourceInfo; base: SourceInfo }) {
    const { target, base } = options;

    let meta;
    try {
      meta = (await Hook.getHookModelByPathname<'base'>(base.pathname))?.meta;
    } catch {
      /* empty */
    }
    if (!meta) throw new VError(`Base template ${base.name} is missing "meta"`);

    hasKeys({
      target: meta,
      keys: ['__dir_src__', '__pathname_entry__'],
      onHasNot(_, key) {
        throw new VError(
          `Base template ${base.name} is missing the "${String(
            key,
          )}" key in meta`,
        );
      },
    });

    return new HookHelper({
      target,
      baseMeta: meta,
    });
  }
}
