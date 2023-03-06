import { program, Argument } from 'commander';
import cmdCreate from './command/create';
import cmdInject from './command/inject';
import cmdUpdate from './command/update';
import cmdRepo, { OPT } from './command/repo';
import reset from './command/reset';
import VError from 'verror';
import { FileInfo } from './File';
import { useEnvVarCurrent } from './utils';

import type { Hooks as _Hooks } from './Hook';

export type { InjectHook, BaseHook } from './Hook';
export type Hooks = Partial<_Hooks>;

const errHandle = (err: Error | VError) => {
  if (err instanceof VError) {
    console.error(chalk.black.bgRed(' ERROR '), chalk.red(err.message));
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
  .command('inject')
  .description('Inject anything into the current project')
  .action(() => cmdInject());

program
  .command('update')
  .description('Update repository')
  .action(() => cmdUpdate());

program
  .command('repo')
  .addArgument(new Argument('[opt]').choices(Object.values(OPT)))
  .description('Manage repository')
  .action((opt) => cmdRepo({ opt }));

program
  .command('reset')
  .description('Reset the CLI')
  .action(() => reset());

program.version(
  new FileInfo({
    pathname: path.resolve(
      useEnvVarCurrent(import.meta.url).__dirname,
      '../package.json',
    ),
  }).getJson().version as string,
);

program.parse();
