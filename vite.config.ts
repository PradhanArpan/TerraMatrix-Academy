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
        entryFileNames: 'assets/terramatrix-app-stage4-1.js',
        chunkFileNames: 'assets/stage4-1-[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/terramatrix-app-stage4-1.css'
          }
          return 'assets/stage4-1-[name][extname]'
        },
      },
    },
  },
})
