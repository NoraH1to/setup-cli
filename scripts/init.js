import { execa } from 'execa';

try {
  await execa('setup-cli update');
} catch {
  /* empty */
}
