import babel from 'rollup-plugin-babel';

export default {
  input: 'src/index.js',
  output: {
    name: 'selenite',
    file: 'index.js',
    format: 'umd',
    sourcemap: true,
    globals: {
      homunculus: 'homunculus',
    },
  },
  plugins: [
    babel({
      exclude: 'node_modules/**', // 只编译我们的源代码
      runtimeHelpers: true
    }),
  ],
};
