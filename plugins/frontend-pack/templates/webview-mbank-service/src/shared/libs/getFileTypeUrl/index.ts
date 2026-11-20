export const getFileTypeUrl = (link: string): string => {
  try {
    // Validate the URL
    const url = new URL(link)

    // Extract the file extension
    const parts = url.pathname.split('.')
    if (parts.length > 1) {
      return parts.pop()?.toUpperCase() || ''
    }
    return ''
  } catch {
    // Return an empty string if the URL is invalid
    return ''
  }
}
