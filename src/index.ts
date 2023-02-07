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
  .option('-l, --list', 'List repository')
  .description('Manage repository')
  .action((opt, options) =>
    cmdRepo({ opt: opt ? opt : options.list ? 'list' : undefined }),
  );

program.parse();
