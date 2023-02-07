import 'zx/globals';

// const getFileListByPathname = (
//   pathname: string,
//   res: FileInfo[] = [],
//   pathStack: string[] = [],
//   cb?: (
//     file: FileInfo,
//     pathStack: string[],
//     pathname: string,
//     res: FileInfo[],
//   ) => unknown,
// ): FileInfo[] => {
//   const filenameList = fs.readdirSync(pathname);
//   for (const filename of filenameList) {
//     const curPathname = path.join(pathname, filename);
//     const state = fs.lstatSync(curPathname);
//     if (state.isDirectory()) {
//       pathStack.push(pathStack.length ? filename : `/${filename}`);
//       getFileListByPathname(curPathname, res, pathStack);
//       pathStack.pop();
//     } else {
//       const curFileInfo = new FileInfo(curPathname);
//       res.push(curFileInfo);
//       cb?.(curFileInfo, pathStack, pathname, res);
//     }
//   }
//   return res;
// };

export class FileInfo {
  public readonly dirname: string;
  public readonly filename: string;
  public readonly pathname: string;
  public readonly ext: string;
  protected content: string;
  protected jsonObj?: Record<string | number, unknown>;

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
    return { ...this.jsonObj };
  }
}

// export class DirInfo {
//   public readonly pathname: string;
//   public readonly fileList: FileInfo[];
//   public readonly fileMap: Record<string, FileInfo>;

//   constructor(options: { pathname: string }) {
//     this.pathname = options.pathname;
//     this.fileList = getFileListByPathname(
//       options.pathname,
//       [],
//       [],
//       (file, pathStack) => {
//         this.fileMap[pathStack.join('/')] = file;
//       },
//     );
//   }
// }
