import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 4006,
    strictPort: true,
    host: true,
    allowedHosts: ['olamvue.ngrok.app', '.ngrok-free.app', '.ngrok.app'],
    proxy: {
      '/api': {
        target: 'https://olammat.ngrok.app',
        changeOrigin: true,
        headers: {
          'ngrok-skip-browser-warning': 'true'
        },
        rewrite: (path) => path.replace(/^\/api/, '/api/produccion')
      }
    }
  }
})
