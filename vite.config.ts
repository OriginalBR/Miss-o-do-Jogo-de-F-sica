import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuração enxuta: nada de plugins extras para o projeto continuar leve.
export default defineConfig({
  plugins: [react()],
  server: {
    // Abre o navegador automaticamente ao rodar `npm run dev`
    open: true,
  },
  build: {
    // Alvo moderno o suficiente para Chromebooks atuais
    target: 'es2020',
  },
})
