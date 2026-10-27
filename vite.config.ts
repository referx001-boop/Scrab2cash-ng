import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base './' so dist/ works from any static host or sub-path (GitHub Pages, Netlify, Vercel)
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: { target: 'es2018', cssCodeSplit: false },
})
