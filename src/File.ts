import '@/utils/helper';

import VError from 'verror';
import { DirInfo } from './Dir';

import type { OmitByValue } from 'utility-types';

export interface Status {
  isDir: boolean;
  exist: boolean;
}
export interface Virtual<
  T,
  PK extends keyof OmitByValue<T, (...args: unknown[]) => unknown> = never,
> {
  virtual?: boolean;
  meta?: Pick<OmitByValue<T, (...args: unknown[]) => unknown>, PK>;
}

type JsonObj = Record<string | number, object | Array<unknown>>;

type FileInfoConstructorOptions = {
  pathname: string;
  parent?: DirInfo;
} & Virtual<FileInfo, 'pathname' | 'parent'>;

const cacheFileInfo = new Map<string, FileInfo>();
export class FileInfo<J extends JsonObj = JsonObj> implements Status {
  public readonly dirname: string;
  public readonly filename: string;
  public readonly pathname: string;
  public readonly ext: string;
  public readonly exist: boolean = false;
  public readonly parent: DirInfo;
  public readonly isDir = false;
  protected content: string;
  protected jsonObj: J;

  /**
   * @deprecated use `FileInfo.build(...)` instead
   */
  constructor(options: FileInfoConstructorOptions) {
    const { virtual, meta } = options;
    let { pathname, parent } = options;
    if (virtual) {
      meta?.pathname && (pathname = meta.pathname);
      meta?.parent && (parent = meta.parent);
    }
    const p = path.parse(pathname);
    if (p.root === '') throw new VError(`Illegal pathname ${pathname}`);
    this.pathname = pathname;
    this.dirname = p.dir;
    this.filename = p.base;
    this.ext = p.ext;
    this.exist = fs.existsSync(this.pathname);
    this.loadContent();
    this.parent = parent;
  }

  public static build(options: FileInfoConstructorOptions) {
    const { pathname } = options;
    if (cacheFileInfo.has(pathname)) return cacheFileInfo.get(pathname);
    else
      return cacheFileInfo.set(pathname, new FileInfo(options)).get(pathname);
  }

  private loadContent() {
    try {
      if (this.exist) {
        const s = fs.readFileSync(this.pathname).toString();
        this.setContent(s);
      }
    } catch (e) {
      console.error(chalk.red((e as Error).stack));
    }
  }

  private updateJson() {
    try {
      if (this.ext === '.json') this.jsonObj = JSON.parse(this.content);
      else if (this.ext === '.yml') this.jsonObj = YAML.parse(this.content);
    } catch (e) {
      if (this.content !== '')
        console.error(chalk.redBright((e as Error).stack));
    }
  }

  public setContent(content: string) {
    this.content = content;
    this.updateJson();
  }

  public getContent() {
    return this.content;
  }

  public getJson() {
    return this.jsonObj;
  }
}
