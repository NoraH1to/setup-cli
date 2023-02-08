import { getCreateOptions } from '@/qa';
import { GeneratorSource } from '@/Source';
import { Generator } from '@/Generator';

const create = async () => {
  const { project, base, inject } = await getCreateOptions();
  const generator = await Generator.build({
    source: new GeneratorSource({
      baseSource: base,
      injectSourceList: inject,
    }),
    target: project,
  });
  await generator.generate();
};

export default create;
