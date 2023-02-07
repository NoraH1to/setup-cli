import 'zx/globals';

import ora from 'ora';
import { nanoid } from 'nanoid';
import { FileInfo } from './File';
import { GeneratorSource } from './Source';
import { useEnvVar } from './utils';
import { Hook } from './Hook';

import type { Ora } from 'ora';
import type { SourceInfo } from './Source';
import type { Hooks } from './Hook';

const { __path_cache_generator } = useEnvVar();

export const copyFile = (options: {
  src: string;
  dest: string;
  mergeFn: Hooks['onMerge'];
}) => {
  const { src, dest, mergeFn } = options;
  if (!fs.existsSync(dest)) {
    fs.copyFileSync(src, dest);
    return;
  }
  const srcFile = new FileInfo(src);
  const destFile = new FileInfo(path.join(dest, srcFile.filename));
  fs.writeFileSync(
    destFile.pathname,
    mergeFn({ src: srcFile, dest: destFile }),
  );
};

export const copy = (options: {
  src: string;
  dest: string;
  mergeFn: Hooks['onMerge'];
}) => {
  const { src, dest, mergeFn } = options;
  const filenameList = fs.readdirSync(src);
  fs.ensureDirSync(dest);
  for (const filename of filenameList) {
    const srcPath = path.join(src, filename);
    const destPath = path.join(dest, filename);
    const state = fs.lstatSync(srcPath);
    if (state.isDirectory()) copy({ src: srcPath, dest: destPath, mergeFn });
    // TODO: should i use less I/O and modify files at memory?
    else copyFile({ src: srcPath, dest, mergeFn });
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
  constructor(source: GeneratorSource<N>, target: SourceInfo) {
    this.source = source;
    this.target = target;
    fs.ensureDirSync(this.tempPathname);
  }

  public static async build<N extends string = string>(
    source: GeneratorSource<N>,
    target: SourceInfo,
  ) {
    const generator = new Generator(source, target);

    // Hook
    generator.setBaseHook(
      await Hook.build({
        pathname: source.getBasePathname(),
        name: source.getBaseName(),
      }),
    );
    for (const injectSourceInfo of source.injectSourceList) {
      generator.setInjectHook(
        injectSourceInfo.name,
        await Hook.build({
          pathname: injectSourceInfo.pathname,
          name: injectSourceInfo.name,
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

  private async generateBase() {
    if (!this.source.baseSource) return;
    this.spinner.start(
      `Generate base - ${chalk.blueBright(this.source.baseSource.name)}`,
    );

    copy({
      src: this.source.getBaseFilesPathname(),
      dest: this.tempPathname,
      mergeFn: this.baseHook.hookMap.onMerge,
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
        mergeFn: this.injectHookMap[injectSourceInfo.name].hookMap.onMerge,
      });
    }
  }

  public async clearTemp() {
    await fs.rm(this.tempPathname, { recursive: true });
  }

  private async output() {
    this.spinner.start('Copy Files');
    await fs.copy(this.tempPathname, this.target.pathname, { overwrite: true });
    await this.clearTemp();

    this.spinner.start('Install dependencies');
    await cd(this.target.pathname);
    await $`pnpm i`;
  }

  public async generate() {
    try {
      await this.generateBase();
      await this.generateInject();
      await this.output();
      this.spinner.succeed(
        `Done, ${chalk.bold.blueBright(`cd ${this.target.name}`)} then enjoy 🥰`,
      );
    } catch (e) {
      await this.clearTemp();
      this.spinner.fail(
        chalk.redBright(this.spinner.text || 'Something error when generating'),
      );
      console.error(chalk.redBright((e as Error).stack));
    }
  }
}
