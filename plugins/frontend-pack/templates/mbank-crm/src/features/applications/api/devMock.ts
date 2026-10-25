// Dev-only: forwards ?mock=empty|error|action-error from the page URL to the MSW handlers,
// so every page state can be opened in the browser. Real API calls ignore it.
export function withDevMock(params = new URLSearchParams()) {
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    const mock = new URLSearchParams(window.location.search).get('mock')
    if (mock) params.set('mock', mock)
  }
  return params.toString()
}
