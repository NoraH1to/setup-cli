import { describe, it, expect } from 'vitest';
import $ from '@/utils/shell';
import path from 'path';
import { useEnvVarCurrent } from '@/utils';

const { __dirname } = useEnvVarCurrent(import.meta.url);

describe('$', () => {
  for (const prop of ['cd', 'cwd', 'verbose']) {
    it(`should have "${prop}" prop`, () => {
      expect($[prop]).not.toBeUndefined();
      expect($[prop]).not.toBeNull();
    });
  }

  it('should logout when verbose is true', async () => {
    $.verbose = true;
    expect(
      (await $`node ${path.resolve(__dirname, './assets/shell/something.js')}`)
        .stdout,
    ).not.toBeUndefined();
  });

  it('should not logout when verbose is false', async () => {
    $.verbose = false;
    expect(
      (await $`node ${path.resolve(__dirname, './assets/shell/something.js')}`)
        .stdout,
    ).toBeUndefined();
  });

  it('should has correct cwd', () => {
    expect($.cwd()).toBe(process.cwd());
  });

  it('should throw error in worker when call cd()', () => {
    // TODO: vitest not support chdir
    expect(() => $.cd('./')).toThrowError();
  });

  it('should normal access to function properties', () => {
    expect($.length).toBeTypeOf('number');
    expect($.call).toBeTypeOf('function');
  });
});
