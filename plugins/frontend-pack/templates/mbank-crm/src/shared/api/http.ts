export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError

export async function http<T>(url: string, parse: (data: unknown) => T, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init)
  if (!response.ok) throw new ApiError(response.status, `Request failed: ${response.status}`)
  return parse(await response.json())
}
