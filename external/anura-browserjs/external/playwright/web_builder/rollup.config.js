import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import { fileURLToPath } from 'node:url';
import alias from '@rollup/plugin-alias';

import inject from '@rollup/plugin-inject';
export default {
  input: 'index.js',
  output: {
    dir: 'output',
    format: 'umd' // or 'cjs', etc.
  },
  plugins: [nodeResolve({
    preferBuiltins: true,
    browser: false,
  }),
  alias({
    entries: [
      { find: 'node:events', replacement: 'events' },
      { find: 'node:path', replacement: 'path' },
      { find: 'node:fs', replacement: 'fs' },
      { find: 'node:util', replacement: 'util' },
      // Add other node: modules as needed
    ]
  }),
  nodePolyfills({
    include: ['buffer']
  }),
  commonjs(),
  json(),
  inject({
    setImmediate: [fileURLToPath(new URL('./polyfill.js', import.meta.url)), "setImmediate"],
    clearImmediate: [fileURLToPath(new URL('./polyfill.js', import.meta.url)), "clearImmediate"],
    Buffer: ['buffer', 'Buffer'],
  }),
  ]
};
