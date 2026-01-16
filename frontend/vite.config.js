
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://trustworthy-solace-production-7618.up.railway.app',
        changeOrigin: true,
      },
    },
  },
})
