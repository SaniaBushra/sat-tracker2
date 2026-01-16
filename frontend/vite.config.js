import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist'
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://trustworthy-solace-production-7618.up.railway.app',
        changeOrigin: true,
      },
    },
  },
})
