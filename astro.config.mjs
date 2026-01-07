import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://sashikoproject.org',
  output: 'static',
  
  // Build output configuration
  build: {
    assets: 'assets',
  },
  
  // Trailing slash for consistent URLs
  trailingSlash: 'never',
  
  integrations: [
    react(),
    tailwind(),
  ],
  
  vite: {
    ssr: {
      noExternal: ['zustand'],
    },
    // Optimize build for production
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'monaco': ['monaco-editor', '@monaco-editor/react'],
          },
        },
      },
    },
  },
});
