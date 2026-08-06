import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: '0.0.0.0', // دي بتخلي الـ Vite يسمع لكل الـ Network Interfaces
    port: 80,
    watch: {
      usePolling: true, // ده بيجبر الـ Vite إنه يراقب الملفات بطريقة تانية لو الـ OS مبيبعتش تنبيه بالتغيير
    },
  },
  base: '/',
  build: {
    rollupOptions: {
      output: {
        // السطور دي بتجبر فيت يسمي الملفات بـ .js صريحة عشان جيتهب ميتلغبطش في الـ MIME type
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
})