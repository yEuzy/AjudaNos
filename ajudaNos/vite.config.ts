import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/proxy/mobilibus': {
        target: 'https://mobilibus.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/mobilibus/, ''),
      },
      '/proxy/escalamedica': {
        target: 'https://escalamedica.uberlandia.mg.gov.br',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/proxy\/escalamedica/, ''),
      }
    }
  }
})
