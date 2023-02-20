import { program, Argument } from 'commander';
import cmdCreate from './command/create';
import cmdUpdate from './command/update';
import cmdRepo, { OPT } from './command/repo';

program
  .command('create')
  .description('Build your template by combining')
  .action(() => cmdCreate());

program
  .command('update')
  .description('Update repository')
  .action(() => cmdUpdate());

program
  .command('repo')
  .addArgument(new Argument('[opt]').choices(Object.values(OPT)))
  .description('Manage repository')
  .action((opt) =>
    cmdRepo({ opt }),
  );

program.parse();

import type { Hooks as _Hooks } from './Hook';
export type { InjectHook, BaseHook } from './Hook';
export type Hooks = Partial<_Hooks>;
