import typescript from 'rollup-plugin-typescript2';
import { DEFAULT_EXTENSIONS } from '@babel/core';
import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'build/index.cjs',
      format: 'cjs',
    },
    {
      dir: 'build',
      format: 'esm',
    },
  ],
  external: ['winston-transport', 'knex'],
  plugins: [
    typescript({ exclude: ['./test/**/*.ts'] }),
    nodeResolve(),
    babel({ extensions: [...DEFAULT_EXTENSIONS, '.ts', '.tsx'], babelHelpers: 'bundled' }),
  ],
};
