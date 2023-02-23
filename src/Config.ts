import '@/utils/helper';

import { FileInfo } from './File';
import { useEnvVar } from './utils';
import VError from 'verror';

import type { Repository } from './Source';

const { __dir_cache } = useEnvVar();

const configPathname = path.resolve(__dir_cache, 'config.yml');

export const defaultRepo = {
  'default-remote': {
    name: 'default-remote',
    type: 'git',
    repository: 'https://github.com/NoraH1to/setup-template.git',
  },
} as const;

export class Config extends FileInfo<{
  repository: { [key: string]: Repository };
}> {
  constructor(pathname) {
    super(pathname);
    if (!this.jsonObj) this.jsonObj = { repository: defaultRepo };
    if (!this.jsonObj.repository) this.jsonObj.repository = defaultRepo;
  }

  public addSource(options: { source: Repository }) {
    const { name } = options.source;
    if (this.jsonObj.repository[name])
      throw new VError(`Source ${name} already exist`);
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
    return this.getJson().repository;
  }

  public clear() {
    this.jsonObj = {
      repository: {},
    };
    return this;
  }

  public save() {
    fs.ensureFileSync(this.pathname);
    fs.writeFileSync(this.pathname, YAML.stringify(this.getJson()));
  }
}

let config: Config;

export const getConfig = () =>
  config ? config : (config = new Config(configPathname));
