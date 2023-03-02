import { DirInfo } from '@/Dir';
import { describe, expect, it } from 'vitest';
import { autoClearCacheDir, getTempCacheDirFn } from './helper';
import fs from 'fs-extra';
import { FileInfo } from '@/File';

const getTempCacheDir = getTempCacheDirFn('dir');

describe('Build DirInfo', () => {
  autoClearCacheDir('dir');

  it('Should work correctly when using unexist paths', () => {
    const pathname = getTempCacheDir();
    expect(() => DirInfo.build({ pathname })).not.toThrowError();
  });

  it('Should work correctly when using exist paths', () => {
    const pathname = getTempCacheDir(true);
    fs.ensureDirSync(path.join(pathname, '/subDir'));
    fs.ensureFileSync(path.join(pathname, '/subDir/content.txt'));
    expect(() => DirInfo.build({ pathname })).not.toThrowError();
  });

  it('Should work correctly with cache', () => {
    const pathname = getTempCacheDir();
    const infoA = DirInfo.build({ pathname });
    const infoB = DirInfo.build({ pathname });
    expect(infoA === infoB).toBeTruthy();
  });
});

describe('Get or check item in DirInfo', () => {
  autoClearCacheDir('dir');

  it('Should has not un-ensure file or dir', () => {
    const pathname = getTempCacheDir();
    const dir = DirInfo.build({ pathname });

    expect(dir.exist).not.toBeTruthy();
    expect(dir.has('/path/no/exist')).not.toBeTruthy();
    expect(dir.get('/path/no/exist')).not.toBeTruthy();
  });

  it('Should has exist file or dir', () => {
    const pathname = getTempCacheDir(true);
    fs.ensureDirSync(path.join(pathname, '/path/exist'));
    const dir = DirInfo.build({ pathname });

    expect(dir.exist).toBeTruthy();
    expect(dir.has('/path/exist')).toBeTruthy();
    expect(dir.get('/path/exist')).toBeTruthy();
  });

  it('Should get item with correct type', () => {
    const pathname = getTempCacheDir();
    const dir = DirInfo.build({ pathname });

    dir.ensure('/dir', { type: 'dir' });
    expect(dir.get('/dir') instanceof DirInfo).toBeTruthy();

    dir.ensure('/file', { type: 'file' });
    expect(dir.get('/file') instanceof FileInfo).toBeTruthy();
  });
});

describe('Ensure item in DirInfo', () => {
  autoClearCacheDir('dir');

  it('Should ensure virtual file or dir', () => {
    const pathname = getTempCacheDir();
    const dir = DirInfo.build({ pathname });
    const subPathname = '/path/no/exist';

    dir.ensure(subPathname, { type: 'dir' });

    expect(dir.has(subPathname)).toBeTruthy();
    expect(dir.get(subPathname)?.exist).not.toBeTruthy();
  });

  it('Should get error when ensure duplicate name at the end', () => {
    const pathname = getTempCacheDir();
    const dir = DirInfo.build({ pathname });

    dir.ensure('/dir', { type: 'dir' });
    expect(() => dir.ensure('/dir', { type: 'file' })).toThrowError();
  });

  it('Should work correctly when ensure same item at the end', () => {
    const pathname = getTempCacheDir();
    const dir = DirInfo.build({ pathname });

    dir.ensure('/dir', { type: 'dir' });
    expect(() => dir.ensure('/dir', { type: 'dir' })).not.toThrowError();
  });

  it('Should get error when there is an existing file before the end', () => {
    const pathname = getTempCacheDir();
    const dir = DirInfo.build({ pathname });

    dir.ensure('/file', { type: 'file' });
    expect(() => dir.ensure('/file/file', { type: 'file' })).toThrowError();
  });

  it('Should work correctly when there is an existing folder before the end', () => {
    const pathname = getTempCacheDir();
    const dir = DirInfo.build({ pathname });

    dir.ensure('/dir', { type: 'dir' });
    expect(() => dir.ensure('/dir/file', { type: 'file' })).not.toThrowError();
  });
});
