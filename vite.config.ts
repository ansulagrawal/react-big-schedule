import { defineConfig } from 'vite';

// The examples app (playground + demos); the library itself is built by scripts/build.cjs.
export default defineConfig({
  root: 'src/examples',
  publicDir: '../../public',
  build: { outDir: '../../dist-demo', emptyOutDir: true },
  server: { port: 8080 },
});
