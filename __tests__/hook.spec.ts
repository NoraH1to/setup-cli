import { describe, expect, it, vi } from 'vitest';
import { Hook, HookHelper } from '@/Hook';
import { getTestTemplateSource, templateSourcePathnameMap } from './helper';
import { getNameByPathnameAndType } from '@/utils';
import { SOURCE_TYPE } from '@/Source';
import ex from '@/utils/helper';
import ora from 'ora';
import inquirer from 'inquirer';
import normalizePath from 'normalize-path';

import type { SourceInfo } from '@/Source';

const source = await getTestTemplateSource();

const getHook = async (
  name: string,
  type: SOURCE_TYPE = 'inject',
  hookHelper: Partial<HookHelper> = {},
) => {
  const pathname = source.injectSourceMap[`default/${name}`].pathname;
  return await Hook.build({
    source: {
      name: getNameByPathnameAndType({
        pathname,
        type,
      }),
      pathname,
    },
    hookHelper: hookHelper as HookHelper,
  });
};

describe('Hook', () => {
  it('should load hooks correct', async () => {
    let hook = await getHook('has-not-hook');
    expect(hook.name).toBe('has-not-hook');
    expect(hook.hasHook('onMerging')).toBe(false);

    hook = await getHook('has-hook');
    expect(hook.name).toBe('has-hook');
    expect(hook.hasHook('onMerging')).toBe(true);
  });

  it('should not throw errors unless user actively throws', async () => {
    let hook = await getHook('has-hook');
    const spy = vi.spyOn(hook.getHookMap(), 'onMerging');
    expect(await hook.callHook('onMerging', {} as any)).toBe('something');
    expect(spy).toBeCalledTimes(1);

    hook = await getHook('has-not-hook');
    expect(hook.hasHook('onMerging')).toBe(false);
    expect(await hook.callHook('onMerging', {} as any)).toBe(undefined);
  });
});

describe('Hook helper', () => {
  const target: SourceInfo = {
    name: 'target',
    pathname: 'target',
  };

  it('should has correct env', async () => {
    const hookHelper = await HookHelper.build({
      target,
      base: {
        name: 'base',
        pathname: templateSourcePathnameMap['base-has-meta'],
      },
    });

    expect(hookHelper.env.__dir_target_root__).toBe(target.pathname);
    expect(hookHelper.env.__pathname_entry__).not.toBeUndefined();
    expect(hookHelper.env.__dir_src__).not.toBeUndefined();
  });

  it('should throw errors when has not meta', async () => {
    await expect(() =>
      HookHelper.build({
        target,
        base: {
          name: 'base',
          pathname: templateSourcePathnameMap['base-has-not-meta'],
        },
      }),
    ).rejects.toThrowError();
  });

  it('should has correct helpers', async () => {
    const hookHelper = await HookHelper.build({
      target,
      base: {
        name: 'base',
        pathname: templateSourcePathnameMap['base-has-meta'],
      },
    });

    expect(hookHelper.helpers).toEqual({
      ...ex,
      ora,
      inquirer,
      normalizePath,
    });
  });
});
