import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 4006,
    strictPort: true,
    host: true,
    allowedHosts: ['olamvue.ngrok.app', '.ngrok-free.app'],
    proxy: {
      '/api': {
        target: 'https://olamproduc.ngrok.app',
        changeOrigin: true
      }
    }
  }
})
