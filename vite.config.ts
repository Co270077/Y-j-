import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import type { ManifestOptions } from 'vite-plugin-pwa'
import fs from 'fs'
import path from 'path'

const certDir = path.resolve(__dirname, 'certs')
const httpsConfig = fs.existsSync(path.join(certDir, 'localhost+3.pem'))
  ? {
      key: fs.readFileSync(path.join(certDir, 'localhost+3-key.pem')),
      cert: fs.readFileSync(path.join(certDir, 'localhost+3.pem')),
    }
  : undefined

// viewport_fit is a valid PWA manifest member for iOS safe-area support.
// vite-plugin-pwa types don't include it yet — cast to extend the type.
const manifest = {
  name: '時間の流れ',
  short_name: '時間の流れ',
  description: 'Flow of Time — Biohacker Daily Optimization',
  theme_color: '#1A1A2E',
  background_color: '#2C2C2C',
  display: 'standalone',
  orientation: 'portrait',
  viewport_fit: 'cover',
  start_url: '.',
  icons: [
    {
      src: 'icons/icon-192x192.png',
      sizes: '192x192',
      type: 'image/png',
    },
    {
      src: 'icons/icon-512x512.png',
      sizes: '512x512',
      type: 'image/png',
    },
    {
      src: 'icons/icon-512x512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable',
    },
  ],
} as Partial<ManifestOptions>

export default defineConfig({
  base: '/',
  server: {
    https: httpsConfig,
    host: true,
  },
  preview: {
    https: httpsConfig,
    host: true,
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png'],
      manifest,
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
})
