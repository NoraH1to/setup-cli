import '@/utils/helper';

import ora from 'ora';
import { FileInfo } from './File';
import { GeneratorSource } from './Source';
import { Hook, HookHelper } from './Hook';
import { DirInfo } from './Dir';
import np from 'normalize-path';
import { isDir, isDirInfo } from './utils';
import { getConfirm } from './qa';

import type { Ora } from 'ora';
import type { SourceInfo } from './Source';
import type { Hooks } from './Hook';

export class Generator<N extends string = string> {
  private source: GeneratorSource<N>;
  private target: SourceInfo;
  private targetDirInfo: DirInfo;
  private curInjectDirInfo: DirInfo;

  private baseHook: Hook;
  private injectHookMap: Record<N, Hook> = {} as Record<N, Hook>;

  private isInject: boolean;

  private spinner: Ora = ora();

  /**
   * @deprecated Use `Generator.build` instead
   */
  constructor(options: { source: GeneratorSource<N>; target: SourceInfo }) {
    const { source, target } = options;
    this.source = source;
    this.target = target;
    this.isInject = !source.baseSource;
    this.targetDirInfo = DirInfo.build({
      pathname: this.target.pathname,
      exclude: ['**/node_modules', '**/.git', '**/out', '**/dist'],
    });
  }

  public static async build<N extends string = string>(options: {
    source: GeneratorSource<N>;
    target: SourceInfo;
  }) {
    const { source, target } = options;

    const generator = new Generator(options);
    const hookHelper = await HookHelper.build({
      target,
      base: source.baseSource,
    });

    // Hook
    !generator.isInject &&
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

  /**
   * src write into dest
   */
  private async copyFile(options: {
    src: FileInfo;
    dest: FileInfo;
    hook: Hook;
  }) {
    const { src, dest, hook } = options;

    await hook.callHook('beforeMerge', {
      srcDir: this.curInjectDirInfo,
      destDir: this.targetDirInfo,
      src,
      dest,
    });

    if (!hook.hasHook('onMerging')) {
      dest.setContent(src.getContent());
    } else {
      dest.setContent(
        await hook.callHook('onMerging', {
          srcDir: this.curInjectDirInfo,
          destDir: this.targetDirInfo,
          src,
          dest,
        }),
      );
    }

    await hook.callHook('afterMerge', {
      srcDir: this.curInjectDirInfo,
      destDir: this.targetDirInfo,
      src,
      dest,
    });
  }

  private async copy(options: { src: DirInfo; dest: DirInfo; hook: Hook }) {
    const { src, dest, hook } = options;
    const map = src.getMap();
    for (const item of Object.values(map)) {
      const destRelPath = np(path.relative(src.pathname, item.pathname));
      if (item.isDir)
        await this.copy({
          src: item,
          dest: dest.ensure(destRelPath, {
            type: 'dir',
          }),
          hook,
        });
      else
        await this.copyFile({
          src: item as unknown as FileInfo,
          dest: dest.ensure(destRelPath, {
            type: 'file',
          }),
          hook,
        });
    }
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
    this.spinner.stop();
    await this.baseHook?.callHook(hookName, ...args);
    for (const hook of Object.values<Hook>(this.injectHookMap)) {
      await hook.callHook(hookName, ...args);
    }
    $.verbose = false;
  }

  private async generateBase() {
    if (!this.source.baseSource) return;
    this.spinner.start(
      `Generate base - ${chalk.blueBright(this.source.baseSource.name)}`,
    );

    this.curInjectDirInfo = DirInfo.build({
      pathname: this.source.getBaseFilesPathname(),
    });
    await this.copy({
      src: this.curInjectDirInfo,
      dest: this.targetDirInfo,
      hook: this.baseHook,
    });
    this.curInjectDirInfo = null;
  }

  private async generateInject() {
    for (const injectSourceInfo of this.source.injectSourceList) {
      this.spinner.start(
        `Generate inject - ${chalk.cyanBright(injectSourceInfo.name)}`,
      );

      this.curInjectDirInfo = DirInfo.build({
        pathname: this.source.getInjectFilesPathnameByName(
          injectSourceInfo.name,
        ),
      });
      await this.copy({
        src: this.curInjectDirInfo,
        dest: this.targetDirInfo,
        hook: this.injectHookMap[injectSourceInfo.name],
      });
      this.curInjectDirInfo = null;
    }
  }

  private async before() {
    if (!fs.existsSync(this.target.pathname) || this.isInject) return;
    let confirm = false;
    if (isDir(this.target.pathname))
      if (fs.readdirSync(this.target.pathname).length)
        confirm = await getConfirm(
          `The content in folder "${this.target.name}" will be deleted, whether to continue`,
        );
      else
        confirm = await getConfirm(
          `Existing file "${this.target.name}" will be deleted, whether to continue`,
        );
    if (!confirm) process.exit(0);
    fs.rmSync(this.target.pathname, { recursive: true });
    fs.ensureDirSync(this.target.pathname);
  }

  private async after() {
    if (this.isInject) return;
    const pkg = this.targetDirInfo.get('/package.json', { type: 'file' });
    if (pkg?.getJson()) {
      const pkgJson = pkg.getJson();
      pkgJson.name = this.target.name;
      pkg.setContent(JSON.stringify(pkgJson));
    }
  }

  private async output(map = this.targetDirInfo.getMap()) {
    const prettierConfig = await prettier.resolveConfig(
      path.join(this.target.pathname),
    );
    this.spinner.start('Output Files');
    for (const item of Object.values(map)) {
      if (isDirInfo(item)) this.output(item.getMap());
      else {
        // format file content
        if (item.hasChange) {
          try {
            const formatted = prettier.format(item.getContent(), {
              ...prettierConfig,
              filepath: item.pathname,
            });
            formatted && item.setContent(formatted);
          } catch {
            // skip
          }
        }
        fs.ensureFileSync(item.pathname);
        fs.writeFileSync(item.pathname, (item as FileInfo).getContent());
      }
    }
  }

  private async installDeps() {
    this.spinner.start('Install dependencies');
    const preCwd = process.cwd();
    await $.cd(this.target.pathname);
    await $`pnpm i`;
    await $.cd(preCwd);
  }

  public async generate() {
    try {
      await this.before();
      await this.callHooks('beforeGenerate');

      await this.generateBase();
      await this.generateInject();
      $.verbose = false;

      await this.callHooks('afterGenerate', { targetDir: this.targetDirInfo });
      await this.after();

      await this.output();

      await this.callHooks('afterOutput');

      await this.installDeps();

      this.isInject
        ? this.spinner.succeed('Done')
        : this.spinner.succeed(
            `Done, ${chalk.bold.blueBright(
              `cd ${this.target.name}`,
            )} then enjoy 🥰`,
          );
    } catch (e) {
      this.spinner.fail(
        chalk.redBright(this.spinner.text || 'Something error when generating'),
      );
      console.error(chalk.redBright((e as Error).stack));
    }
  }
}
