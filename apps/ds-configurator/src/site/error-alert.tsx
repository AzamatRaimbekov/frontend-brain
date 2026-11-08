// An API error as the user reads it: the message and the list of field errors from the server.
import { Alert, AlertDescription, AlertTitle } from "@/generated/kit/ui/alert"

import { ApiError } from "./api"

export function ErrorAlert({ error, title }: { error: Error | null; title?: string }) {
  if (!error) return null
  const list = error instanceof ApiError ? error.errors : []
  return (
    <Alert tone="error" role="alert">
      {title ? <AlertTitle>{title}</AlertTitle> : null}
      <AlertDescription>
        {error.message}
        {list.length ? <ul className="mt-1 list-disc pl-4">{list.map((x) => <li key={x}>{x}</li>)}</ul> : null}
      </AlertDescription>
    </Alert>
  )
}
