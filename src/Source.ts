import '@/utils/helper';

import normalizePath from 'normalize-path';
import { getNameByPathnameAndType, useEnvVar } from './utils';
import { getConfig } from './Config';
import VError from 'verror';

import type { UnionValues } from './utils';

const { __path_cache_git } = useEnvVar();

export const PATHNAME = {
  FILES: 'files',
  HOOK: 'hook',
} as const;
export type PATHNAME = UnionValues<typeof PATHNAME>;

export const REPOSITORY_TYPE = {
  GIT: 'git',
  LOCAL: 'local',
} as const;
export type REPOSITORY_TYPE = UnionValues<typeof REPOSITORY_TYPE>;

export const SOURCE_TYPE = {
  BASE: 'base',
  INJECT: 'inject',
} as const;
export type SOURCE_TYPE = UnionValues<typeof SOURCE_TYPE>;

export interface SourceInfo<N extends string = string> {
  name: N;
  pathname: string | null;
}

export const ensureRepository = async (options: {
  repo: Repository;
  onProcess?: () => void;
}): Promise<string> => {
  const { repository, type } = options.repo;

  const targetPath =
    type === 'git' ? getGitRepositoryLocalPath(repository) : repository;

  await fs.ensureDir(targetPath);

  if (type === 'local') return targetPath;

  options.onProcess?.();

  if (!fs.existsSync(path.resolve(targetPath, '.git'))) {
    await $`git config --global core.longpaths true`;
    await $`git clone ${repository} ${targetPath}`;
    await $`git -C ${targetPath} checkout -B main `;
  } else {
    await $`git -C ${targetPath} checkout -B main `;
    await $`git -C ${targetPath} pull origin main `;
  }

  if (
    !(
      await globby(normalizePath(path.join(targetPath, '*')), {
        onlyDirectories: true,
        onlyFiles: false,
        deep: 1,
      })
    ).length
  ) {
    console.warn(chalk.yellow('Repository is empty'));
  }

  return targetPath;
};

export const getGitRepositoryLocalPath = (repository: string) => {
  return path.resolve(__path_cache_git, repository.replace(/[@,:,/]/g, '_'));
};

interface BaseSource {
  baseSource: SourceInfo;
  getBaseName: () => BaseSource['baseSource']['name'];
  getBasePathname: () => BaseSource['baseSource']['pathname'];
  getBaseFilesPathname: () => string;
}

interface InjectSource<N extends string = string> {
  injectSourceList: SourceInfo[];
  injectSourceMap: Record<N, SourceInfo<N>>;
  getInjectFilesPathnameByName: (name: N) => null | string;
}

export interface Repository {
  name: string;
  repository: string;
  type: REPOSITORY_TYPE;
}

export class TemplateSource<
  N extends string = string,
  B extends string = string,
> implements InjectSource<N>
{
  public readonly baseSourceList: SourceInfo[];
  public readonly baseSourceMap: Record<B, SourceInfo<B>> = {} as Record<
    B,
    SourceInfo<B>
  >;
  public readonly injectSourceList: SourceInfo[];
  public readonly injectSourceMap: Record<N, SourceInfo<N>> = {} as Record<
    N,
    SourceInfo<N>
  >;

  constructor(options: {
    baseSourceList: SourceInfo<B>[];
    injectSourceList: SourceInfo<N>[];
  }) {
    this.baseSourceList = options.baseSourceList;
    this.injectSourceList = options.injectSourceList;
    for (const injectSourceInfo of options.injectSourceList) {
      this.injectSourceMap[injectSourceInfo.name] = injectSourceInfo;
    }
    for (const baseSourceInfo of options.baseSourceList) {
      this.baseSourceMap[baseSourceInfo.name] = baseSourceInfo;
    }
  }

  public getInjectFilesPathnameByName(name: string) {
    if (!this.injectSourceMap[name]) return null;
    return path.join(this.injectSourceMap[name].pathname, PATHNAME.FILES);
  }

  public static async build(options: {
    repositoryList: Repository[];
    baseSourceList?: SourceInfo[];
    injectSourceList?: SourceInfo[];
  }) {
    const {
      baseSourceList = [],
      injectSourceList = [],
      repositoryList,
    } = options;

    const globOption = { deep: 1, onlyDirectories: true, onlyFiles: false };
    const getSourceByPathAndType = async (
      pathname: string,
      type: SOURCE_TYPE,
      prefixName?: string,
    ): Promise<SourceInfo[]> => {
      const glob = `${type}-*`;
      return (
        await globby(normalizePath(path.join(pathname, glob)), globOption)
      ).map((pathname) => ({
        pathname: path.resolve(pathname),
        name: `${prefixName}${prefixName ? '/' : ''}${getNameByPathnameAndType({
          pathname,
          type,
        })}`,
      }));
    };

    for (const repo of repositoryList) {
      const { name, repository, type } = repo;

      let repositoryLocalPath;

      if (type === 'local') repositoryLocalPath = repository;
      else if (type === 'git')
        repositoryLocalPath = getGitRepositoryLocalPath(repository);
      else throw new VError(`Wrong repository type "${type}"`);

      if (!fs.existsSync(repositoryLocalPath))
        throw new VError(
          `There is no exist ${type} repository "${name}" ${
            type === 'git' ? repository : repositoryLocalPath
          }\nMake sure the local path is exist or use "setup-cli update" to update git repo.`,
        );

      // e.g. base-a  ->  { name: <repoName>/a }
      baseSourceList.push(
        ...(await getSourceByPathAndType(repositoryLocalPath, 'base', name)),
      );
      injectSourceList.push(
        ...(await getSourceByPathAndType(repositoryLocalPath, 'inject', name)),
      );
    }

    return new TemplateSource({
      baseSourceList,
      injectSourceList,
    });
  }
}

export class GeneratorSource<N extends string = string>
  implements InjectSource<N>, BaseSource
{
  public readonly baseSource: SourceInfo;
  public readonly injectSourceList: SourceInfo<N>[];
  public readonly injectSourceMap: Record<N, SourceInfo<N>> = {} as Record<
    N,
    SourceInfo<N>
  >;

  constructor(options: {
    baseSource?: SourceInfo;
    injectSourceList: SourceInfo<N>[];
  }) {
    this.baseSource = options.baseSource;
    this.injectSourceList = options.injectSourceList;
    for (const injectSourceInfo of options.injectSourceList) {
      this.injectSourceMap[injectSourceInfo.name] = injectSourceInfo;
    }
  }

  public getBaseName() {
    return this.baseSource.name;
  }

  public getBasePathname() {
    return this.baseSource.pathname;
  }

  public getBaseFilesPathname() {
    if (!this.baseSource) return null;
    return path.join(this.getBasePathname(), PATHNAME.FILES);
  }

  public getInjectFilesPathnameByName(name: string) {
    if (!this.injectSourceMap[name]) return null;
    return path.join(this.injectSourceMap[name].pathname, PATHNAME.FILES);
  }
}

let templateSource: TemplateSource;

export const getTemplateSource = async () => {
  if (templateSource) return templateSource;
  return (templateSource = await TemplateSource.build({
    repositoryList: Object.values(getConfig().getSource()),
  }));
};
