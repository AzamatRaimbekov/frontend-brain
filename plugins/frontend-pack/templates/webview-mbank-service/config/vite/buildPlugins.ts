import terser from '@rollup/plugin-terser'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { PluginOption } from 'vite'
import checker from 'vite-plugin-checker'
import compression from 'vite-plugin-compression2'
import { ViteEjsPlugin } from 'vite-plugin-ejs'
import { createHtmlPlugin } from 'vite-plugin-html'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import { reactClickToComponent } from 'vite-plugin-react-click-to-component'

import { dynamicTypesPlugin } from '../pliguns/vite-plugin-dynamic-types'

export function buildPlugins(): PluginOption[] {
  return [
    dynamicTypesPlugin() as PluginOption,
    visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: false,
    }) as PluginOption,
    ViteImageOptimizer({
      jpg: { quality: 75 },
      png: { quality: 80 },
      webp: { quality: 80 },
      avif: { quality: 80 },
    }) as PluginOption,
    tailwindcss() as PluginOption,
    compression({ algorithm: 'gzip' }) as PluginOption,
    ViteEjsPlugin((viteConfig) => ({
      env: viteConfig.env,
    })) as PluginOption,
    // progress(),
    createHtmlPlugin({ minify: true }) as PluginOption,
    react() as PluginOption,
    reactClickToComponent() as PluginOption,
    checker({
      typescript: true,
      overlay: false,
      terminal: false,
    }) as PluginOption,
    terser({
      compress: {
        drop_console: true,
      },
      maxWorkers: 4,
    }) as PluginOption,
  ]
}
