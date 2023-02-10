import '@/utils/helper';

import { FileInfo } from './File';
import { useEnvVar } from './utils';

import type { Repository } from './Source';

const { __path_cache } = useEnvVar();

const pathname = path.resolve(__path_cache, 'config.yml');

export class Config extends FileInfo {
  protected declare jsonObj: { repository?: { [key: string]: Repository } };
  constructor() {
    super(pathname);
    fs.ensureFileSync(this.pathname);
    if (!this.jsonObj) this.jsonObj = {};
    if (!this.jsonObj.repository)
      // TODO: replace test repo
      this.jsonObj.repository = {
        'default-remote': {
          name: 'default-remote',
          type: 'git',
          repository: 'git@github.com:NoraH1to/setup-template-test.git',
        },
      };
    this.save();
  }

  public addSource(options: { source: Repository }) {
    const { name } = options.source;
    if (this.jsonObj.repository[name])
      throw new Error(`Source ${name} already exist`);
    else this.editSource(options);
    return this;
  }

  public editSource(options: { source: Repository }) {
    const { name } = options.source;
    this.jsonObj.repository[name] = {
      ...options.source,
    };
    return this;
  }

  public delSource(options: { name: string }) {
    delete this.jsonObj.repository[options.name];
    return this;
  }

  public getSource() {
    return this.jsonObj.repository;
  }

  public clear() {
    this.jsonObj = {};
    return this;
  }

  public save() {
    fs.writeFileSync(this.pathname, YAML.stringify(this.jsonObj));
  }
}

export const getConfig = () => new Config();
