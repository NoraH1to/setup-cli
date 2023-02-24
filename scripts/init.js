import { execaCommand } from 'execa';
import chalk from 'chalk';

try {
  await execaCommand('setup-cli update', {
    stdout: 'inherit',
    stdin: 'inherit',
    stderr: 'inherit',
  });
} catch (e) {
  console.error(
    chalk.black.bgYellow('NOTICE!'),
    chalk.yellow(
      'Init default repo fail. Please execute setup-cli update manually.',
    ),
  );
  console.error(e.stack);
}
