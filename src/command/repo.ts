import { getConfig } from '@/Config';
import { getRepoOptions } from '@/qa';
import Ora from 'ora';

const sp = Ora();

const addRepo = async () => {
  const { name, type, repository } = await getRepoOptions({
    needSelectName: false,
  });
  getConfig().addSource({ source: { name, type, repository } }).save();
};

const rmRepo = async () => {
  const { name } = await getRepoOptions({
    needType: false,
    needRepository: false,
  });
  getConfig().delSource({ name }).save();
};

const setRepo = async () => {
  const { name, type, repository } = await getRepoOptions({});
  getConfig().editSource({ source: { name, type, repository } }).save();
};

const listRepo = async () => {
  console.log(
    Object.values(getConfig().getSource())
      .map(
        (repo) =>
          `[${
            repo.type === 'local'
              ? chalk.blue(repo.type)
              : chalk.yellow(repo.type)
          }] - [${chalk.green(repo.name)}]: ${repo.repository}`,
      )
      .join('\n'),
  );
};

export const OPT = {
  ADD: 'add',
  RM: 'rm',
  SET: 'set',
  LIST: 'list',
} as const;

const repo = async (options: { opt: (typeof OPT)[keyof typeof OPT] }) => {
  const { opt } = options;
  switch (opt) {
    case OPT.ADD:
      await addRepo();
      break;
    case OPT.RM:
      await rmRepo();
      break;
    case OPT.SET:
      await setRepo();
      break;
    case OPT.LIST:
      await listRepo();
      break;
    default:
      sp.fail('Unexist opt');
  }
};

export default repo;
