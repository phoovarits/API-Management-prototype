import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base = ชื่อ repo เพื่อให้ asset path ถูกต้องบน GitHub Pages
// (https://<user>.github.io/API-Management-prototype/)
export default defineConfig({
  base: '/API-Management-prototype/',
  plugins: [react()],
  server: { port: 5173, open: true },
})
