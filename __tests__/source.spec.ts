import { describe, expect, it, vi } from 'vitest';
import {
  ensureRepository,
  GeneratorSource,
  getGitRepositoryLocalPath,
  PATHNAME,
  REPOSITORY_TYPE,
  TemplateSource,
} from '@/Source';
import path from 'path';
import { getTestTemplateSource, templateSourcePathnameMap } from './helper';

import type { Repository } from '@/Source';

describe('Ensure git repo', () => {
  const repo: Repository = {
    name: 'test',
    repository: 'https://github.com/NoraH1to/setup-template-test.git',
    type: 'git',
  };
  const repoDir = getGitRepositoryLocalPath(repo.repository);

  it(
    'should clone repo when local dir is empty',
    async () => {
      if (fs.existsSync(repoDir)) fs.rmSync(repoDir, { recursive: true });
      expect(fs.existsSync(path.resolve(repoDir, './.git'))).not.toBeTruthy();
      await ensureRepository({
        repo,
      });
      expect(fs.existsSync(path.resolve(repoDir, './.git'))).toBeTruthy();
    },
    { timeout: 1000 * 60 },
  );

  it(
    'should update repo if exist',
    async () => {
      await ensureRepository({
        repo,
      });
      await ensureRepository({
        repo,
      });
      expect(fs.existsSync(path.resolve(repoDir, './.git'))).toBeTruthy();
    },
    { timeout: 1000 * 60 },
  );

  it(
    'should call "onProcess" when start check',
    async () => {
      if (fs.existsSync(repoDir)) fs.rmSync(repoDir, { recursive: true });
      const onProcess = vi.fn();
      await await ensureRepository({
        repo,
        onProcess,
      });
      expect(onProcess).toBeCalledTimes(1);
    },
    { timeout: 1000 * 60 },
  );
});

describe('Template source', () => {
  it('should load correct template', async () => {
    const source = await getTestTemplateSource('default');

    expect(source.baseSourceList.length).toBe(3);
    expect(source.injectSourceList.length).toBe(3);

    expect(source.baseSourceMap['default/has-meta']).toBeTruthy();
    expect(source.baseSourceMap['default/has-not-meta']).toBeTruthy();
    expect(source.injectSourceMap['default/has-hook']).toBeTruthy();
    expect(source.injectSourceMap['default/has-not-hook']).toBeTruthy();

    expect(source.getInjectFilesPathnameByName('default/has-hook')).toBe(
      path.resolve(
        templateSourcePathnameMap['inject-has-hook'],
        PATHNAME.FILES,
      ),
    );
  });

  it('should throw errors when git repo is empty at local', async () => {
    await expect(() =>
      TemplateSource.build({
        repositoryList: [
          {
            name: 'test',
            repository: 'un_exist_repo_path_name',
            type: 'git',
          },
        ],
      }),
    ).rejects.toThrowError();
  });

  it('should throw errors when provide an wrong type', async () => {
    await expect(() =>
      TemplateSource.build({
        repositoryList: [
          {
            name: 'test',
            repository: 'something_pathname',
            type: 'wrong_type' as REPOSITORY_TYPE,
          },
        ],
      }),
    ).rejects.toThrowError();
  });
});

describe('Generator source', () => {
  it('should return correct prop', async () => {
    const baseName = 'base-has-meta';
    const basePathname = templateSourcePathnameMap['base-has-meta'];
    const injectName = 'inject-has-hook';
    const injectPathname = templateSourcePathnameMap['inject-has-hook'];
    const generatorSource = new GeneratorSource({
      baseSource: {
        name: baseName,
        pathname: basePathname,
      },
      injectSourceList: [
        {
          name: injectName,
          pathname: injectPathname,
        },
      ],
    });

    expect(generatorSource.getBaseName()).toBe(baseName);
    expect(generatorSource.getBasePathname()).toBe(basePathname);
    expect(generatorSource.getBaseFilesPathname()).toBe(
      path.resolve(basePathname, PATHNAME.FILES),
    );
    expect(generatorSource.getInjectFilesPathnameByName(injectName)).toBe(
      path.resolve(injectPathname, PATHNAME.FILES),
    );
  });
});
