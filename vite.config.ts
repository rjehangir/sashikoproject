import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/sashiko/', // Change to '/' for custom domain
  build: {
    outDir: 'dist',
  },
});
