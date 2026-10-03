import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const frontendRoot = fileURLToPath(new URL('.', import.meta.url));
const repositoryRoot = path.resolve(frontendRoot, '..');
const outputRoot = path.resolve(frontendRoot, '../src/thoth/web');
// Vite may clear only this generated directory belonging to this repository.
if (outputRoot !== path.join(repositoryRoot, 'src', 'thoth', 'web')) {
  throw new Error('Refusing to clear an unexpected frontend output directory.');
}

export default defineConfig({
  root: frontendRoot,
  build: { outDir: outputRoot, emptyOutDir: true },
  server: { proxy: { '/api': 'http://127.0.0.1:8765' } }
});
