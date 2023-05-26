import '@/utils/helper';

import VError from 'verror';
import { DirInfo } from './Dir';

export interface Status {
  exist: boolean;
}

type JsonObj = Record<string | number, any>;

type FileInfoConstructorOptions = {
  pathname: string;
  parent?: DirInfo;
};

const cacheFileInfo = new Map<string, FileInfo>();
export class FileInfo<J extends JsonObj = JsonObj> implements Status {
  public readonly dirname: string;
  public readonly filename: string;
  public readonly pathname: string;
  public readonly ext: string;
  public readonly exist: boolean = false;
  public readonly parent: DirInfo;
  public readonly isDir = false;
  public hasChange = false;
  protected content: string;
  protected jsonObj: J;

  /**
   * @deprecated use `FileInfo.build(...)` instead
   */
  constructor(options: FileInfoConstructorOptions) {
    const { pathname, parent } = options;
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
      if (this.ext === '.json')
        this.jsonObj = JSON.parse(
          this.content.replace(
            /\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g,
            (m, g) => (g ? '' : m),
          ),
        );
      else if (this.ext === '.yml') this.jsonObj = YAML.parse(this.content);
    } catch (e) {
      if (this.content !== '')
        throw new VError(
          `[FileInfo]-[updateJson]-[${this.pathname}]`,
          chalk.redBright((e as Error).stack),
        );
    }
  }

  public setContent(content: string) {
    this.content = content;
    this.updateJson();
    this.hasChange = true;
  }

  public getContent() {
    return this.content;
  }

  public getJson() {
    return this.jsonObj;
  }
}
