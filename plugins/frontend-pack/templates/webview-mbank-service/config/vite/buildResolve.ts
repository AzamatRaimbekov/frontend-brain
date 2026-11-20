export function buildResolve() {
  // @todo добавим @
  return {
    alias: {
      '@shared': '/src/shared',
      '@pages': '/src/pages',
      '@app': '/src/app',
      '@modules': '/src/modules',
      '@config': '/config',
      '@types': '/src/@types',
    },
  }
}
