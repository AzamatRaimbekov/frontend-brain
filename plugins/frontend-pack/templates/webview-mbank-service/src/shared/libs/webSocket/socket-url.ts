export const getSocketUrl = (path: string) => {
  if (import.meta.env.DEV) {
    return `ws://10.0.10.27/ws/${path}`
  }

  return `ws://${window.location.host}/ws/${path}`
}
