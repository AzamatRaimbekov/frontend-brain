interface FieldErrorProps {
  message?: string
}

/** Forms rule: a field error is shown in red text right under its field. */
export function FieldError({ message }: FieldErrorProps) {
  if (!message) return null

  return (
    <p
      className="mt-1 px-4 text-sm text-destructive"
      role="alert"
    >
      {message}
    </p>
  )
}
