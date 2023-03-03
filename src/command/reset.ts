import { getConfirm } from '@/qa';
import { useEnvVar } from '@/utils';
import ora from 'ora';
import VError from 'verror';

const reset = async () => {
  const confirm = await getConfirm(
    'All configuration files and cache will be deleted',
  );
  const sp = ora();

  if (!confirm) {
    sp.fail('Cancel');
    return;
  }

  sp.start('Reset');
  try {
    await fs.rm(useEnvVar().__dir_cache, { recursive: true });
  } catch (e) {
    sp.fail(`Reset fail because: ${(e as Error).message}`);
    throw new VError(e);
  }
  sp.succeed('Done');
};

export default reset;
