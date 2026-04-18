import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor-react';
            if (id.includes('monaco-editor')) return 'vendor-editor';
            if (id.includes('react-icons')) return 'vendor-icons';
            return 'vendor-utils';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})
