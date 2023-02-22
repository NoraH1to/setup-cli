import { program, Argument } from 'commander';
import cmdCreate from './command/create';
import cmdUpdate from './command/update';
import cmdRepo, { OPT } from './command/repo';
import VError from 'verror';

const errHandle = (err: Error | VError) => {
  if (err instanceof VError) {
    console.error(chalk.black.bgRed(' ERROR ') ,chalk.red(err.message));
    process.exit(0);
  } else {
    console.error(chalk.black.bgRed(' UNCATCH ERROR '), chalk.red(err.stack));
    process.exit(1);
  }
};

process.on('uncaughtException', errHandle);

process.on('unhandledRejection', errHandle);

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
  .action((opt) => cmdRepo({ opt }));

program.parse();

import type { Hooks as _Hooks } from './Hook';
export type { InjectHook, BaseHook } from './Hook';
export type Hooks = Partial<_Hooks>;
