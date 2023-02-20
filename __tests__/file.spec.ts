import { describe, expect, it } from 'vitest';
import { FileInfo } from '@/File';
import path from 'path';
import { getPathnameMapByNameAndExtList } from './helper';

let pathnameMap = {
  emptyJson: '',
  emptyYml: '',
  emptyFile: '',
  somethingJson: '',
  somethingYml: '',
  somethingFile: '',
} as const;

pathnameMap = getPathnameMapByNameAndExtList(['empty', 'something'], ['json', 'yml', 'file'], 'file') as typeof pathnameMap;

describe('FileInfo', () => {
  it('should throw error when pathname is illegal', () => {
    expect(() => new FileInfo('./illegal.file')).toThrowError();
  });

  it('should has empty content and jsonObj when file is empty', () => {
    let file = new FileInfo(pathnameMap.emptyJson);
    expect(file.getContent()).toBe(undefined);
    expect(file.getJson()).toBe(undefined);

    file = new FileInfo(pathnameMap.emptyYml);
    expect(file.getContent()).toBe(undefined);
    expect(file.getJson()).toBe(undefined);

    file = new FileInfo(pathnameMap.emptyFile);
    expect(file.getContent()).toBe(undefined);
    expect(file.getJson()).toBe(undefined);
  });

  it('should has content when file has content', () => {
    let file = new FileInfo(pathnameMap.somethingJson);
    expect(file.getContent()).toBe('{ "something": "something" }\n');

    file = new FileInfo(pathnameMap.somethingYml);
    expect(file.getContent()).toBe("something: 'something'\n");

    file = new FileInfo(pathnameMap.somethingFile);
    expect(file.getContent()).toBe('something\n');
  });

  it('should has jsonObj when .yml and .json are not empty', () => {
    let file = new FileInfo(pathnameMap.somethingJson);
    expect(file.getJson()).toEqual({ something: 'something' });

    file = new FileInfo(pathnameMap.somethingYml);
    expect(file.getJson()).toEqual({ something: 'something' });
  });

  it('should has not jsonObj when not .yml and .json', () => {
    const file = new FileInfo(pathnameMap.somethingFile);
    expect(file.getJson()).toBe(undefined);
  });

  it('should update jsonObj when content update', () => {
    let file = new FileInfo(pathnameMap.somethingJson);
    file.setContent('{ "something": "newSomething" }');
    expect(file.getJson()).toEqual({ something: 'newSomething' });

    file = new FileInfo(pathnameMap.somethingYml);
    file.setContent("something: 'newSomething'");
    expect(file.getJson()).toEqual({ something: 'newSomething' });
  });

  it('should has not content when file not exist', () => {
    const file = new FileInfo(path.resolve('unexist.file'));
    expect(file.getContent()).toBeUndefined();
  });
});
