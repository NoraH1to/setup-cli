import { FileInfo, Status } from './File';
import np from 'normalize-path';
import { isDir } from './utils';
import VError from 'verror';
import { minimatch } from 'minimatch';

import type { Required } from 'utility-types';

type DirInfoConstructorOptions = {
  parent?: DirInfo | null;
  pathname: string;
  exclude?: string[];
};
type DirInfoCURDOptions = {
  type?: 'file' | 'dir';
};
type DirOrFile<T extends DirInfoCURDOptions> = T['type'] extends 'file'
  ? FileInfo
  : T['type'] extends 'dir'
  ? DirInfo
  : FileInfo | DirInfo;

const cacheDirInfo = new Map<string, DirInfo>();
export class DirInfo implements Status {
  public readonly name: string;
  public readonly pathname: string;
  public readonly dirname: string;
  public readonly parent: DirInfo;
  public readonly isDir = true;
  public readonly exist: boolean = false;

  private readonly fileMap: Record<string, FileInfo> = {};
  private readonly dirMap: Record<string, DirInfo> = {};
  private cachePath: Map<string, FileInfo | DirInfo> = new Map();

  /**
   * @deprecated use `DirInfo.build(...)` instead
   */
  constructor(options: DirInfoConstructorOptions) {
    const { pathname, parent, exclude = [] } = options;

    this.parent = parent;
    this.pathname = pathname;
    this.dirname = path.dirname(pathname);
    this.name = path.basename(this.pathname);

    if (!(this.exist = fs.existsSync(this.pathname))) return;

    // build tree
    const oriDirInfo = fs.readdirSync(this.pathname, { withFileTypes: true });
    oriDirInfo
      .filter((f) => {
        const pathname = np(path.join(this.pathname, f.name));
        return exclude.every((e) => !minimatch(pathname, e));
      })
      .forEach((f) => {
        if (isDir(path.resolve(this.pathname, f.name))) {
          this.dirMap[f.name] = DirInfo.build({
            parent: this,
            pathname: path.join(this.pathname, f.name),
            exclude,
          });
        } else
          this.fileMap[f.name] = FileInfo.build({
            pathname: path.join(this.pathname, f.name),
            parent: this,
          });
      });
  }

  /**
   * build with cache
   */
  public static build(options: DirInfoConstructorOptions) {
    const { pathname } = options;
    if (cacheDirInfo.has(pathname) && !!cacheDirInfo.get(pathname))
      return cacheDirInfo.get(pathname);
    else return cacheDirInfo.set(pathname, new DirInfo(options)).get(pathname);
  }

  /**
   * @param pathname `"/path/to/something"`
   */
  public has(pathname: string, options: DirInfoCURDOptions = {}) {
    const paths = DirInfo.np(pathname).split('/');
    if (!paths.length) return false;
    return !!this._dig(paths, { ...options, ensure: false });
  }

  /**
   * @param pathname `"/path/to/something"`
   */
  public get<O extends DirInfoCURDOptions>(
    name: string,
    options?: O,
  ): DirOrFile<O>;
  public get<O extends DirInfoCURDOptions>(
    pathname: string,
    options: O = {} as O,
  ) {
    const paths = DirInfo.np(pathname).split('/');
    return this._dig(paths, { ...options, ensure: false });
  }

  public getMap<O extends DirInfoCURDOptions>(
    options?: O,
  ): Record<string, DirOrFile<O>>;
  public getMap<O extends DirInfoCURDOptions>(options: O = {} as O) {
    if (!options.type) return { ...this.dirMap, ...this.fileMap };
    else if (options.type === 'dir') return { ...this.dirMap };
    else return { ...this.fileMap };
  }

  /**
   * @param pathname `"/path/to/something"`
   */
  public ensure<O extends Required<DirInfoCURDOptions, 'type'>>(
    name: string,
    options: O,
  ): DirOrFile<O>;
  public ensure<O extends Required<DirInfoCURDOptions, 'type'>>(
    pathname: string,
    options: O,
  ) {
    const paths = DirInfo.np(pathname).split('/');
    return this._dig(paths, { ...options, ensure: true });
  }

  private _dig(
    paths: string[],
    options: DirInfoCURDOptions & { ensure?: boolean } = { ensure: false },
  ): FileInfo | DirInfo {
    // use cache
    const cacheKey = paths.join('/');
    if (this.cachePath.has(cacheKey)) return this.cachePath.get(cacheKey);

    const cur = paths.shift();
    const isTarget = !paths.length;
    const needEnsure = options.ensure && options.type;
    const curTarget = this._getAny(cur);

    // ensure
    if (needEnsure) {
      if (
        isTarget
          ? curTarget && curTarget.isDir !== (options.type === 'dir')
          : this._hasFile(cur)
      ) {
        throw new VError(
          `Failed to create ${curTarget.isDir ? 'file' : 'folder'} "${
            curTarget.pathname
          }", a ${
            curTarget.isDir ? 'folder' : 'file'
          } with the same name already exists`,
        );
      }
      const map = isTarget
        ? options.type === 'dir'
          ? this.dirMap
          : this.fileMap
        : this.dirMap;
      const build = isTarget
        ? options.type === 'dir'
          ? DirInfo.build
          : FileInfo.build
        : DirInfo.build;
      const pathname = path.resolve(this.pathname, cur);
      map[cur] = build({ pathname, parent: this });
    }

    // target
    let res;
    if (isTarget) {
      res = this._getAny(cur, options);
    } else {
      // recursive
      res = this._getDir(cur)?._dig(paths, options);
      // cache path
      paths.unshift(cur);
      this.cachePath.set(cacheKey, res);
      paths.shift();
    }
    return res;
  }

  /**
   * @description format pathname
   */
  private static np(pathname: string) {
    pathname = np(path.join(pathname.trim()));
    if (pathname.startsWith('/')) pathname = pathname.replace('/', '');
    return pathname;
  }

  /**
   * private getter
   */
  private _getAny<O extends DirInfoCURDOptions>(
    name: string,
    options?: O,
  ): DirOrFile<O>;
  private _getAny<O extends DirInfoCURDOptions>(
    name: string,
    options: O = {} as O,
  ): DirInfo | FileInfo {
    const { type } = options;
    if (!type) return this._getDir(name) || this._getFile(name);
    else return type === 'dir' ? this._getDir(name) : this._getFile(name);
  }
  private _getDir(name: string) {
    return this.dirMap[name];
  }
  private _getFile(name: string) {
    return this.fileMap[name];
  }

  /**
   * private checker
   */
  private _hasAny(name: string, options: DirInfoCURDOptions = {}) {
    if (!options.type) return this._hasDir(name) || this._hasFile(name);
    else
      return options.type === 'dir' ? this._hasDir(name) : this._hasFile(name);
  }
  private _hasDir(name: string) {
    return !!this._getDir(name);
  }
  private _hasFile(name: string) {
    return !!this._getFile(name);
  }
}
