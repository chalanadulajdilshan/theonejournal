import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1/theonejournal',
        changeOrigin: true,
        rewrite: (path) => path,
      },
    },
  },
  build: {
    // Emit one complete stylesheet per page so shared CSS isn't dropped when
    // splitting across the two entries.
    cssCodeSplit: false,
    rollupOptions: {
      // Two separate apps: the public website (/) and the admin console (/admin/)
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        admin: fileURLToPath(new URL('./admin/index.html', import.meta.url)),
      },
    },
  },
})
