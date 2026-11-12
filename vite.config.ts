import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // relative base so the same build works at /<repo>/ on GitHub Pages and at /
  base: './',
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      // this host's file events are unreliable; polling keeps HMR honest
      usePolling: true,
      interval: 300,
    },
  },
})
