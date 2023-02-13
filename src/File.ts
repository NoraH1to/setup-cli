import '@/utils/helper';

type JsonObj = Record<string | number, object | Array<unknown>>;

export class FileInfo<J extends JsonObj = JsonObj> {
  public readonly dirname: string;
  public readonly filename: string;
  public readonly pathname: string;
  public readonly ext: string;
  protected content: string;
  protected jsonObj: J;

  constructor(pathname: string) {
    this.pathname = pathname;
    this.dirname = path.dirname(pathname);
    this.filename = path.basename(pathname);
    this.ext = path.extname(this.filename);
    this.loadContent();
  }

  private loadContent() {
    try {
      if (fs.existsSync(this.pathname))
        this.setContent(fs.readFileSync(this.pathname).toString());
    } catch (e) {
      console.error(chalk.red(e));
    }
  }

  private updateJson() {
    if (this.ext === '.json') this.jsonObj = JSON.parse(this.content);
    else if (this.ext === '.yml') this.jsonObj = YAML.parse(this.content);
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
