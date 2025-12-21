import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/QR-NUMBER/',   // REPO adın neyse onu yaz
  plugins: [react()],
})
