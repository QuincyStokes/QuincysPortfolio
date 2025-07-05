import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: '.',            // adjust if your code lives in a subfolder
  build: {
    outDir: 'dist'
  }
});
