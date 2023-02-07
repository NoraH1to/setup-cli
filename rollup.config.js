import pluginTerser from '@rollup/plugin-terser';
import pluginTypescript from '@rollup/plugin-typescript';
import pluginEslint from '@rollup/plugin-eslint';
import pluginDelete from 'rollup-plugin-delete';

/**
 * @type {import("rollup").RollupOptions}
 */
const config = {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.mjs',
      format: 'esm',
    },
  ],
  plugins: [
    pluginDelete({
      targets: ['dist/*'],
    }),
    pluginEslint(),
    pluginTypescript(),
    pluginTerser(),
  ],
};

export default config;
