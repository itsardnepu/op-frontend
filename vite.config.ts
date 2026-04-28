import path from 'node:path'
import os from 'node:os'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Default cache is node_modules/.vite — on Windows + Dropbox that folder is often locked (EBUSY)
// while sync runs; keep the cache outside the synced tree.
const cacheDir = path.join(os.homedir(), '.cache', 'onepanchang-frontend-vite')

export default defineConfig({
  cacheDir,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico',
        'logo.svg',
        'pwa-64x64.png',
        'pwa-192x192.png',
        'pwa-512x512.png',
        'maskable-icon-512x512.png',
        'apple-touch-icon-180x180.png',
      ],
      manifest: {
        name: 'One Panchang',
        short_name: 'One Panchang',
        description: 'Daily panchang — tithi, nakshatra, yoga, karana, festivals',
        theme_color: '#1e3a5f',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Do not cache /api responses: misconfigured hosts can serve index.html as 200 and CacheFirst would persist bad data.
      },
    }),
  ],
})
