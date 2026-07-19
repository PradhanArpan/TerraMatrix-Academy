import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const assetBase = 'https://terra-matrix-academy.vercel.app/'

export default defineConfig({
  base: assetBase,
  plugins: [react()],
  build: {
    assetsInlineLimit: 0,
    cssCodeSplit: false,
    chunkSizeWarningLimit: 2500,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/terramatrix-app.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/terramatrix-app.css'
          }
          return 'assets/[name][extname]'
        },
      },
    },
  },
})
