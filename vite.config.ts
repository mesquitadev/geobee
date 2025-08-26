import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    react(),
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240, // Compressão para arquivos maiores que 10 KB
    }),
  ],
  server: {
    port: 3000,
    open: true, // Abre no navegador automaticamente
    host: true, // Permite acessar via IP local
  },
})
