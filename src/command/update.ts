import '@/utils/helper';

import ora from 'ora';

import { ensureRepository } from '@/Source';
import { getConfig } from '@/Config';

const update = async () => {
  $.verbose = false;
  const sp = ora('Update repository').start();
  try {
    for (const repo of Object.values(getConfig().getSource())) {
      await ensureRepository({
        repo,
        onProcess: () =>
          sp.start(
            `Updating ${chalk.blueBright(repo.name)} - ${repo.repository}`,
          ),
      });
    }
    sp.succeed('Update done');
  } catch (e) {
    sp.fail(chalk.redBright(sp.text || 'Something error when updating'));
    console.error(chalk.redBright((e as Error).stack));
  }
};

export default update;
