import autoprefixer from 'autoprefixer'
import browserslist from 'browserslist'

import { browserslistToTargets } from 'lightningcss'

export function buildCss(mode: string) {
  return {
    modules: {
      generateScopedName:
        mode === 'development'
          ? '[path][name]__[local]'
          : '[name]__[hash:base64:5]',
      postcss: {
        plugins: [autoprefixer],
      },
      lightningcss: {
        targets: browserslistToTargets(browserslist('>= 0.1%')),
      },
      transformer: 'lightningcss',
    },
  }
}
