import { describe, it, expect } from 'vitest';
import '@/utils/helper';

describe('import helper', () => {
  for (const module of ['$', 'YAML', 'chalk', 'fs', 'path', 'os', 'globby', 'prettier']) {
    it(`should have "${module}" in global`, () => {
      expect(Object.hasOwn(global, module)).toBe(true);
    });
  }
});
