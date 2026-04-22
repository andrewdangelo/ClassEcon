import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // host: true → listen on 0.0.0.0 so Docker port publishing (localhost:5174 → container) works
  server: {
    host: true,
    port: 5174,
    strictPort: true,
  },
})
