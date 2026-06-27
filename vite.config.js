import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base = './' → asset ถูกอ้างแบบ relative path
//   ใช้งานได้ทั้ง root (Vercel) และ subpath (GitHub Pages /API-Management-prototype/)
//   แอปนี้ navigate ด้วย state ไม่ใช่ router ที่อิง URL path จึงใช้ relative base ได้
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { port: 5173, open: true },
})
