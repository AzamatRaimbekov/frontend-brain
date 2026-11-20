import type { ModuleFormat } from 'rollup'

export function buildOptions(mode: string) {
  return {
    assetsDir: '',
    cssCodeSplit: true,
    sourcemap: mode === 'development',
    modulePreload: { polyfill: false },
    minify: true,
    cssMinify: 'lightningcss' as const,
    rollupOptions: {
      output: {
        format: 'es' as ModuleFormat,
        entryFileNames: '[name]-[hash].js',
        assetFileNames: '[name]-[hash].[ext]',
        chunkFileNames: 'assets/[name]-[hash].js',

        manualChunks(id: string) {
          if (id.includes('/src/shared/iconpack/icons/')) {
            return id.split('/').pop()
          }

          if (!id.includes('/node_modules/')) return

          if (id.includes('/react/') || id.includes('/react-dom/')) {
            return 'react'
          }
          if (
            id.includes('/react-router-dom/') ||
            id.includes('/@remix-run/')
          ) {
            return 'router'
          }
          if (
            id.includes('/@reduxjs/toolkit/') ||
            id.includes('/react-redux/') ||
            id.includes('/redux/')
          ) {
            return 'redux'
          }
          if (id.includes('/@base-ui/react/')) return 'base-ui'
          if (id.includes('/i18next/') || id.includes('/react-i18next/')) {
            return 'i18n'
          }
          if (id.includes('/@sentry/')) return 'sentry'
          if (id.includes('/lucide-react/')) return 'lucide'
          if (id.includes('/md-glyphs/')) return 'md-glyphs'
        },
      },
    },
  }
}
