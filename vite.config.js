import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base = ชื่อ repo เฉพาะตอน build (สำหรับ GitHub Pages)
//   - build : /API-Management-prototype/  → asset path ถูกต้องบน Pages
//   - dev   : /                            → เปิด http://localhost:5173/ ได้ปกติ
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/API-Management-prototype/' : '/',
  plugins: [react()],
  server: { port: 5173, open: true },
}))
