import 'zx/globals';

import normalizePath from 'normalize-path';
import { FileInfo } from './File';
import { useEnvVar } from './utils';

import type { Repository } from './Source';

const { __path_cache, __path_src_root } = useEnvVar();

const pathname = path.resolve(__path_cache, 'config.yml');

class Config extends FileInfo {
  protected declare jsonObj: { repository?: { [key: string]: Repository } };
  constructor() {
    super(pathname);
    fs.ensureFileSync(this.pathname);
    if (!this.jsonObj) this.jsonObj = {};
    if (!this.jsonObj.repository)
      // TODO: 去除测试
      this.jsonObj.repository = {
        default: {
          name: 'default',
          // type: 'git',
          // repository: 'git@github.com:NoraH1to/setup-template-test.git',
          type: 'local',
          repository: normalizePath(
            path.resolve(__path_src_root, '../../template'),
          ),
        },
      };
    this.save();
  }

  public addSource(options: { name: string; source: Repository }) {
    const { name } = options;
    if (this.jsonObj[name]) throw new Error(`Source ${name} already exist`);
    else this.editSource(options);
    return this;
  }

  public editSource(options: { name: string; source: Repository }) {
    const { name, source } = options;
    this.jsonObj[name] = {
      ...source,
      name,
    };
    return this;
  }

  public delSource(options: { name: string }) {
    delete this.jsonObj[options.name];
  }

  public getSource() {
    return this.jsonObj.repository;
  }

  public async save() {
    await fs.writeFile(this.pathname, YAML.stringify(this.jsonObj));
  }
}

export const getConfig = () => new Config();
