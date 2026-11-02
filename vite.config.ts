import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configured with relative base ('./') so all assets and bundles resolve cleanly
// on GitHub Pages (both https://<user>.github.io/<repo>/ and custom domains).
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'bundle',
  },
});
