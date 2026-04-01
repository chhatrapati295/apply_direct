import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'resume.pdf'],
      pwaAssets: {
        disabled: false,
        config: false,
        image: 'public/favicon.svg',
      },
      manifest: {
        name: 'Apply Direct',
        short_name: 'ApplyDirect',
        description:
          'A polished single-purpose app for sending application emails with EmailJS and your default resume attached.',
        theme_color: '#fff8f0',
        background_color: '#fff8f0',
        display: 'standalone',
        start_url: '/',
      },
      workbox: {
        globPatterns: ['**/*.{css,html,ico,js,pdf,png,svg,webmanifest}'],
      },
    }),
  ],
})
