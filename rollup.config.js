import typescript from '@rollup/plugin-typescript';
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
  plugins: [
    typescript({ exclude: ['./test/**/*.ts'] }),
    nodeResolve(),
    babel({ babelHelpers: 'bundled' }),
  ],
};
