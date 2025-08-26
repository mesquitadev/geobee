import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
    plugins: [react()],
    server: {
        host: true, // Permite acesso externo na rede local
        watch: {
            usePolling: true,
        },
    },
});
