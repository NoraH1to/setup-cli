import { program } from 'commander';
import cmdCreate from './command/create';
import cmdUpdate from './command/update';

program
  .command('create')
  .description('build your template by combining')
  .action(() => cmdCreate());

program
  .command('update')
  .description('update template repository')
  .action(() => cmdUpdate());

program.parse();
