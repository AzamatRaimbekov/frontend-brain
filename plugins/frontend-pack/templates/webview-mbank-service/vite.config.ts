import { UserConfig, defineConfig, loadEnv } from 'vite'

import { buildCss } from './config/vite/buildCss'
import { buildDefine } from './config/vite/buildDefine'
import { buildOptions } from './config/vite/buildOptions'
import { buildPlugins } from './config/vite/buildPlugins'
import { buildResolve } from './config/vite/buildResolve'
import { buildServer } from './config/vite/buildServer'

export default defineConfig(({ mode }): UserConfig => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    publicDir: 'public',
    // define: buildDefine(env),
    plugins: buildPlugins(),
    server: buildServer(env, 3000),
    resolve: buildResolve(),
    css: buildCss(mode),
    build: buildOptions(mode),
  }
})
