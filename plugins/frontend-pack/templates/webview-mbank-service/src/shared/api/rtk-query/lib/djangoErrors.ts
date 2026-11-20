interface DjangoError {
  detail: string
  attr: string
}

export interface DjangoErrorResponse {
  data: {
    errors: DjangoError[]
    status: number
    type: string
  }
}

export const isDjangoError = (err: unknown): err is DjangoErrorResponse => {
  return (
    typeof err === 'object' &&
    err !== null &&
    'data' in err &&
    typeof err.data === 'object' &&
    err.data !== null &&
    'errors' in err.data &&
    Array.isArray(err.data.errors)
  )
}

export const getDjangoErrorMessages = (err: DjangoErrorResponse) => {
  return err.data.errors.map((e) => e?.detail || '')
}

export const getDjangoErrorAttrs = (err: DjangoErrorResponse) => {
  return err.data.errors.map((e) => e?.attr || '')
}
