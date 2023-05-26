import _$ from './shell';
import * as _ from './goods';
export * from './goods';

declare global {
  const $: typeof _$;
  const YAML: typeof _.YAML;
  const chalk: typeof _.chalk;
  const fs: typeof _.fs;
  const path: typeof _.path;
  const os: typeof _.os;
  const globby: typeof _.globby;
  const prettier: typeof _.prettier;
}

const ex = { $: _$, ..._ };

Object.assign(global, ex);

export default ex;
