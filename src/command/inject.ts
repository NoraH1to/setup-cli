import { Generator } from '@/Generator';
import { getInjectOptions } from '@/qa';
import { GeneratorSource } from '@/Source';
import { packageDirectory } from 'pkg-dir';
import VError from 'verror';

const inject = async () => {
  const pathname = await packageDirectory();
  if (!pathname)
    throw new VError('The command needs to be executed in the project');

  const { inject } = await getInjectOptions();
  if (!inject.length) return;

  const generate = await Generator.build({
    source: new GeneratorSource({ injectSourceList: inject }),
    target: {
      pathname,
      name: 'current',
    },
  });
  await generate.generate();
};

export default inject;
