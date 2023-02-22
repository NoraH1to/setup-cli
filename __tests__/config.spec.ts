import { describe, it, expect } from 'vitest';
import { Config, defaultRepo } from '@/Config';
import { useEnvVar } from '@/utils';
import { getPathnameMapByNameAndExtList } from './helper';
import { nanoid } from 'nanoid';

import type { Repository } from '@/Source';

const { __dir_cache_test } = useEnvVar();

describe('Source', () => {
  let pathnameMap = {
    emptyYml: '',
    hasNotSourceYml: '',
  } as const;

  pathnameMap = getPathnameMapByNameAndExtList(
    ['empty', 'hasNotSource'],
    ['yml'],
    'config',
  ) as typeof pathnameMap;

  const config = new Config(pathnameMap.emptyYml).clear();
  expect(config.getSource()).toEqual({});
  const mockConfig: Record<string, Repository> = {
    a: {
      name: 'a',
      repository: 'a',
      type: 'git',
    },
    b: {
      name: 'b',
      repository: 'b',
      type: 'local',
    },
  };

  it('could add source', () => {
    config.addSource({
      source: mockConfig.a,
    });
    expect(config.getSource()).toEqual({
      a: mockConfig.a,
    });

    config.addSource({
      source: mockConfig.b,
    });
    expect(config.getSource()).toEqual({
      a: mockConfig.a,
      b: mockConfig.b,
    });
  });

  it('could not add an already exist source', () => {
    expect(() =>
      config.addSource({
        source: mockConfig.b,
      }),
    ).toThrowError();
  });

  it('could delete source', () => {
    config.delSource({ name: 'a' });
    expect(config.getSource()).toEqual({
      b: mockConfig.b,
    });

    config.delSource({ name: 'b' });
    expect(config.getSource()).toEqual({});
  });

  it("could delete source even it doesn't exist", () => {
    config.delSource({ name: 'a' });
    expect(() => config.getSource()).not.toThrowError();
  });

  it('edit no exist source will like add it', () => {
    expect(config.getSource().a).toBe(undefined);
    config.editSource({
      source: mockConfig.a,
    });
    expect(config.getSource().a).toEqual(mockConfig.a);
  });

  it('could edit source', () => {
    config.editSource({
      source: {
        ...mockConfig.a,
        repository: 'new repo',
      },
    });
    expect(config.getSource().a.repository).toBe('new repo');
  });

  it('should has default value when has not source', () => {
    let config = new Config(pathnameMap.emptyYml);
    expect(config.getSource()).toEqual(defaultRepo);

    config = new Config(pathnameMap.hasNotSourceYml);
    expect(config.getSource()).toEqual(defaultRepo);
  });

  it('should generate file after save() called', () => {
    const configPathname = path.resolve(
      __dir_cache_test,
      `./config/${nanoid()}Config.yml`,
    );

    expect(fs.existsSync(configPathname)).not.toBeTruthy();

    const config = new Config(configPathname);
    expect(fs.existsSync(configPathname)).not.toBeTruthy();

    config.save();
    expect(fs.existsSync(configPathname)).toBeTruthy();

    fs.removeSync(configPathname);
    expect(fs.existsSync(configPathname)).not.toBeTruthy();
  });
});
