// appointments-api/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/appointments/', // 👈 importante (ajusta en cada app)
})
