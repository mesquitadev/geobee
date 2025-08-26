import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import viteCompression from 'vite-plugin-compression'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Plugin para PWA - melhora experiência mobile
    // Compressão de ativos para melhor performance em dispositivos móveis
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
  ],
  server: {
    port: 3000, // Porta do servidor de desenvolvimento
    open: true, // Abre o navegador automaticamente
    allowedHosts: ['.localhost', '.ngrok-free.app', '*'], // Permite hosts específicos
    // Configurações adicionais para mobile
    host: true, // Permite acesso via IP da rede local
  },
  build: {
    // Estratégia de caching melhorada para dispositivos móveis
    cssCodeSplit: true,
    sourcemap: false,
    reportCompressedSize: false, // Desabilita relatório de tamanhos comprimidos para build mais rápida
    rollupOptions: {
      output: {
        // Dividir chunks para otimizar carregamento em conexões móveis lentas
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor'
            }

            if (
              id.includes('@headlessui/react') ||
              id.includes('@radix-ui/react-collapsible')
            ) {
              return 'ui-components'
            }

            if (id.includes('leaflet')) {
              return 'map-libs'
            }

            // Agrupa outros pacotes pelo nome do pacote
            return id
              .toString()
              .split('node_modules/')[1]
              .split('/')[0]
              .toString()
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Ajuste o limite de tamanho do chunk conforme necessário
    // Otimizações adicionais para dispositivos móveis
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs em produção
        drop_debugger: true, // Remove debugger em produção
      },
    },
  },
  assetsInclude: ['**/*.kml'],
})
