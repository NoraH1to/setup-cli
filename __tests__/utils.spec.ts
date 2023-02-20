import { describe, it, expect, vi } from 'vitest';
import { getNameByPathnameAndType, hasKeys } from '@/utils';

describe('Get name by pathname and type', () => {
  it('should work well when put an legit value', () => {
    expect(
      getNameByPathnameAndType({
        pathname: '/any/path/base-something',
        type: 'base',
      }),
    ).toBe('something');
  });

  it('should return null when cant find match result', () => {
    expect(
      getNameByPathnameAndType({
        pathname: '/any/path/baseSomething',
        type: 'base',
      }),
    ).toBeNull();
  });
});

describe('Check object has keys or not', () => {
  it('should return true when has all keys', () => {
    const target = {
      a: 'a',
      b: 'b',
    };
    expect(hasKeys({ target, keys: ['a', 'b'] })).toBeTruthy();
    expect(hasKeys({ target, keys: ['a'] })).toBeTruthy();
  });

  it('should return false when any key no exist', () => {
    const target: { a?: string } = {};
    expect(hasKeys({ target, keys: ['a'] })).not.toBeTruthy();

    let unexistKey;
    const onHasNot = vi.fn().mockImplementation((_, key) => {
      unexistKey = key;
    });
    expect(hasKeys({ target, keys: ['a'], onHasNot })).not.toBeTruthy();
    expect(onHasNot).toBeCalledTimes(1);
    expect(unexistKey).toBe('a');
  });
});
