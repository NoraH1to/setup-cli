import 'zx/globals';

import ora from 'ora';
import { nanoid } from 'nanoid';
import { FileInfo } from './File';
import { GeneratorSource } from './Source';
import { useEnvVar } from './utils';
import { Hook, HookHelper } from './Hook';

import type { Ora } from 'ora';
import type { SourceInfo } from './Source';
import type { Hooks } from './Hook';

const { __path_cache_generator } = useEnvVar();

export const copyFile = async (options: {
  src: string;
  dest: string;
  hook: Hook;
}) => {
  const { src, dest, hook } = options;
  if (!fs.existsSync(dest)) {
    fs.copyFileSync(src, dest);
    return;
  }
  const srcFile = new FileInfo(src);
  const destFile = new FileInfo(path.join(dest, srcFile.filename));
  fs.writeFileSync(
    destFile.pathname,
    await hook.callHook('onMerge', { src: srcFile, dest: destFile }),
  );
};

export const copy = async (options: {
  src: string;
  dest: string;
  hook: Hook;
}) => {
  const { src, dest, hook } = options;
  const filenameList = fs.readdirSync(src);
  fs.ensureDirSync(dest);
  for (const filename of filenameList) {
    const srcPath = path.join(src, filename);
    const destPath = path.join(dest, filename);
    const state = fs.lstatSync(srcPath);
    if (state.isDirectory()) copy({ src: srcPath, dest: destPath, hook });
    // TODO: should i use less I/O and modify files at memory?
    else await copyFile({ src: srcPath, dest, hook });
  }
};

export class Generator<N extends string = string> {
  private hash: string = nanoid();

  private tempPathname: string = path.resolve(
    __path_cache_generator,
    this.hash,
  );

  private source: GeneratorSource<N>;
  private target: SourceInfo;

  private baseHook: Hook;
  private injectHookMap: Record<N, Hook> = {} as Record<N, Hook>;

  private spinner: Ora = ora();

  /**
   * @deprecated Use `Generator.build` instead
   */
  constructor(options: { source: GeneratorSource<N>; target: SourceInfo }) {
    const { source, target } = options;
    this.source = source;
    this.target = target;
    fs.ensureDirSync(this.tempPathname);
  }

  public static async build<N extends string = string>(options: {
    source: GeneratorSource<N>;
    target: SourceInfo;
  }) {
    const { source, target } = options;

    const generator = new Generator(options);
    const hookHelper = new HookHelper({ target });

    // Hook
    generator.setBaseHook(
      await Hook.build({
        source: {
          pathname: source.getBasePathname(),
          name: source.getBaseName(),
        },
        hookHelper,
      }),
    );
    for (const injectSourceInfo of source.injectSourceList) {
      generator.setInjectHook(
        injectSourceInfo.name,
        await Hook.build({
          source: {
            pathname: injectSourceInfo.pathname,
            name: injectSourceInfo.name,
          },
          hookHelper,
        }),
      );
    }

    return generator;
  }

  private setBaseHook(hook: Hook) {
    this.baseHook = hook;
  }

  private setInjectHook(key: string, hook: Hook) {
    this.injectHookMap[key] = hook;
  }

  private async callHooks<N extends keyof Hooks>(
    hookName: N,
    ...args: Parameters<Hooks[N]>
  ) {
    await this.baseHook.callHook(hookName, ...args);
    for (const hook of Object.values<Hook>(this.injectHookMap)) {
      await hook.callHook(hookName, ...args);
    }
  }

  private async generateBase() {
    if (!this.source.baseSource) return;
    this.spinner.start(
      `Generate base - ${chalk.blueBright(this.source.baseSource.name)}`,
    );

    copy({
      src: this.source.getBaseFilesPathname(),
      dest: this.tempPathname,
      hook: this.baseHook,
    });
  }

  private async generateInject() {
    for (const injectSourceInfo of this.source.injectSourceList) {
      this.spinner.start(
        `Generate inject - ${chalk.cyanBright(injectSourceInfo.name)}`,
      );

      copy({
        src: this.source.getInjectFilesPathnameByName(injectSourceInfo.name),
        dest: this.tempPathname,
        hook: this.injectHookMap[injectSourceInfo.name],
      });
    }
  }

  public async clearTemp() {
    await fs.rm(this.tempPathname, { recursive: true });
  }

  private async output() {
    this.spinner.start('Copy Files');
    await fs.copy(this.tempPathname, this.target.pathname, { overwrite: true });
  }

  private async installDeps() {
    this.spinner.start('Install dependencies');
    const preCwd = process.cwd();
    await cd(this.target.pathname);
    await $`pnpm i`;
    await cd(preCwd);
  }

  public async generate() {
    try {
      await this.callHooks('beforeGenerate');

      await this.generateBase();
      await this.generateInject();
      await this.output();

      this.spinner.stop();
      await this.callHooks('afterGenerate');

      await this.installDeps();

      this.spinner.succeed(
        `Done, ${chalk.bold.blueBright(
          `cd ${this.target.name}`,
        )} then enjoy 🥰`,
      );
    } catch (e) {
      this.spinner.fail(
        chalk.redBright(this.spinner.text || 'Something error when generating'),
      );
      console.error(chalk.redBright((e as Error).stack));
    } finally {
      await this.clearTemp();
    }
  }
}
