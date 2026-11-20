import { logger } from '../logger'
import { TokenStorage } from '../storage/tokenStorage'

export async function downloadFile(options: {
  baseUrl: string
  fileName: string
  params?: Record<string, string>
  withoutAuth?: boolean
}) {
  const { baseUrl, fileName = 'report', params, withoutAuth } = options

  if (!baseUrl) {
    logger.error('provide url in downloadFile function')
    return
  }

  const url = new URL(baseUrl)

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value))
    })
  }

  const accessToken = TokenStorage.getFromStorage()

  const anchor = document.createElement('a')
  document.body.appendChild(anchor)

  const headers = withoutAuth
    ? new Headers()
    : new Headers({ Authorization: `Bearer ${accessToken}` })

  fetch(url.toString(), { headers })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Ошибка при скачивании: ${response.statusText}`)
      }
      return response.blob()
    })
    .then((blob) => {
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    })
    .catch((err) => logger.error(`Ошибка при скачивании: ${err}`))
}
