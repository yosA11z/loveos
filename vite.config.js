import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'src/pages/login.html'),
        dashboard: resolve(__dirname, 'src/pages/dashboard.html'),
        reset: resolve(__dirname, 'src/pages/reset-password.html'),
        privacidad: resolve(__dirname, 'src/pages/privacidad.html'),
        terminos: resolve(__dirname, 'src/pages/terminos.html'),
        sabermas: resolve(__dirname, 'src/pages/saber-mas.html'),
      }
    }
  }
})