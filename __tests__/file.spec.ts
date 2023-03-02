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

pathnameMap = getPathnameMapByNameAndExtList(
  ['empty', 'something'],
  ['json', 'yml', 'file'],
  'file',
) as typeof pathnameMap;

describe('FileInfo', () => {
  it('should throw error when pathname is illegal', () => {
    expect(() => FileInfo.build({ pathname: './illegal.file' })).toThrowError();
  });

  it('should has empty content and jsonObj when file is empty', () => {
    let file = FileInfo.build({ pathname: pathnameMap.emptyJson });
    expect(file.getContent()).not.toBeTruthy();
    expect(file.getJson()).not.toBeTruthy();

    file = FileInfo.build({ pathname: pathnameMap.emptyYml });
    expect(file.getContent()).not.toBeTruthy();
    expect(file.getJson()).not.toBeTruthy();

    file = FileInfo.build({ pathname: pathnameMap.emptyFile });
    expect(file.getContent()).not.toBeTruthy();
    expect(file.getJson()).not.toBeTruthy();
  });

  it('should has content when file has content', () => {
    let file = FileInfo.build({ pathname: pathnameMap.somethingJson });
    expect(file.getContent()).toBe('{ "something": "something" }\n');

    file = FileInfo.build({ pathname: pathnameMap.somethingYml });
    expect(file.getContent()).toBe("something: 'something'\n");

    file = FileInfo.build({ pathname: pathnameMap.somethingFile });
    expect(file.getContent()).toBe('something\n');
  });

  it('should has jsonObj when .yml and .json are not empty', () => {
    let file = FileInfo.build({ pathname: pathnameMap.somethingJson });
    expect(file.getJson()).toEqual({ something: 'something' });

    file = FileInfo.build({ pathname: pathnameMap.somethingYml });
    expect(file.getJson()).toEqual({ something: 'something' });
  });

  it('should has not jsonObj when not .yml and .json', () => {
    const file = FileInfo.build({ pathname: pathnameMap.somethingFile });
    expect(file.getJson()).toBe(undefined);
  });

  it('should update jsonObj when content update', () => {
    let file = FileInfo.build({ pathname: pathnameMap.somethingJson });
    file.setContent('{ "something": "newSomething" }');
    expect(file.getJson()).toEqual({ something: 'newSomething' });

    file = FileInfo.build({ pathname: pathnameMap.somethingYml });
    file.setContent("something: 'newSomething'");
    expect(file.getJson()).toEqual({ something: 'newSomething' });
  });

  it('should has not content when file not exist', () => {
    const file = FileInfo.build({ pathname: path.resolve('unexist.file') });
    expect(file.getContent()).toBeUndefined();
  });

  it('should build with cache', () => {
    const fileA = FileInfo.build({ pathname: path.resolve('file') });
    const fileB = FileInfo.build({ pathname: path.resolve('file') });
    expect(fileA === fileB).toBeTruthy();
  });
});
