export interface ErrorResponse {
  message: string
  detail?: string
  response?: {
    data: { message: string }
    status: number
    statusText: string
  }
}
