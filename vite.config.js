import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Botmaker no permite llamadas directas desde el navegador (CORS),
// así que /api se reenvía a la API de Botmaker tanto en "npm run dev" como en "npm run preview".
const botmakerProxy = {
  '/api': {
    target: 'https://api.botmaker.com/v2.0',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, ''),
  },
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { proxy: botmakerProxy },
  preview: { proxy: botmakerProxy },
})
