import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  root: 'frontend',
  base: './',
  plugins: [react()],
  server: {
    // The sale backend (umina-achala-server) runs on this port; live, Nginx
    // sends /api/ to it the same way (#58)
    proxy: {
      '/api': 'http://127.0.0.1:8787'
    }
  },
  build: {
    outDir: '../build',
    emptyOutDir: true
  }
})
