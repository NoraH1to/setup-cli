import '@/utils/helper';

import VError from 'verror';

type JsonObj = Record<string | number, object | Array<unknown>>;

export class FileInfo<J extends JsonObj = JsonObj> {
  public readonly dirname: string;
  public readonly filename: string;
  public readonly pathname: string;
  public readonly ext: string;
  public readonly exist: boolean;
  protected content: string;
  protected jsonObj: J;

  constructor(pathname: string) {
    const p = path.parse(pathname);
    if (p.root === '')
      throw new VError(`Illegal pathname ${pathname}`);
    this.pathname = pathname;
    this.dirname = p.dir;
    this.filename = p.base;
    this.ext = p.ext;
    this.exist = fs.existsSync(this.pathname);
    this.loadContent();
  }

  private loadContent() {
    try {
      if (this.exist) {
        const s = fs.readFileSync(this.pathname).toString();
        this.setContent(s === '' ? undefined : s);
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
      if (this.content !== undefined)
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
