import path from 'path';
import { execaCommand } from 'execa';

export const cd = (pathname: string) => {
  if (pathname) process.chdir(path.resolve(process.cwd(), pathname));
};

export const cwd = () => process.cwd();

const defaultStore = {
  cd,
  cwd,
  verbose: true,
};

class Shell {
  private store: typeof defaultStore;
  constructor(store = defaultStore) {
    this.store = store;
  }

  run(pieces: TemplateStringsArray, ...args: unknown[]) {
    let cmd = pieces[0];
    let i = 0;
    while (i < args.length) {
      cmd += args[i] + pieces[++i];
    }

    const promise = execaCommand(cmd, {
      stdout: 'pipe',
      stdin: 'inherit',
      stderr: 'pipe',
    });

    const { stderr, stdout } = promise;
    [stderr, stdout].forEach(
      (std) =>
        this.store.verbose && std.pipe(process.stderr),
    );

    return promise;
  }
}

const exec = new Proxy(
  function (...args: Parameters<Shell['run']>) {
    const shell = new Shell();
    return shell.run(...args);
  },
  {
    get(target, key) {
      const _target = key in Function.prototype ? target : defaultStore;
      return Reflect.get(_target, key);
    },
    set(_, key, receiver) {
      const target = key in Function.prototype ? _ : defaultStore;
      Reflect.set(target, key, receiver);
      return true;
    },
  },
);

const _$ = exec as typeof exec & {
  cd: typeof cd;
  cwd: typeof cwd;
  verbose: boolean;
};

export default _$;
export const $ = _$;
