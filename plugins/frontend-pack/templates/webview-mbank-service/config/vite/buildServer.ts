export function buildServer(env: Record<string, string>, port: number) {
  return {
    port: port,
    host: true,
    open: false,
    logLevel: 'info',
    proxy: {
      '/api/media': {
        target: env.VITE_BASE_DOMEN,
        changeOrigin: true,
        rewrite: (p: string) => p.replace(/^\/api/, ''),
      },
      '/api': {
        target: env.VITE_BASE_DOMEN + '/api',
        changeOrigin: true,
        rewrite: (p: string) => p.replace(/^\/api/, ''),
      },
      '/ru/api': {
        target: env.VITE_BASE_DOMEN + '/ru/api',
        changeOrigin: true,
        rewrite: (p: string) => p.replace(/^\/ru\/api/, ''),
      },
      '/kg/api': {
        target: env.VITE_BASE_DOMEN + '/kg/api',
        changeOrigin: true,
        rewrite: (p: string) => p.replace(/^\/kg\/api/, ''),
      },
    },
  }
}
