import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    react(),
    // Compressão de ativos para melhor performance
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
  build: {
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 1000, // Limite para alerta de chunk grande
    rollupOptions: {
      output: {
        // Gera chunks apenas para pacotes principais
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendors'
            }
          }
        },
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
})
