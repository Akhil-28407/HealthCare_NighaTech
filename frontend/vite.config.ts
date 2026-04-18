import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-utils': ['axios', 'zustand', 'zod', 'react-hot-toast'],
          'vendor-editor': ['@monaco-editor/react'],
          'vendor-icons': ['react-icons'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})
