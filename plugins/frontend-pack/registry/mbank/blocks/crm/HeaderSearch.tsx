import { useId } from "react"

import { cn } from "@/shared/lib/utils"
import { Input } from "@/shared/ui/input"
import { SearchIcon } from "./crm-icons"

type HeaderSearchProps = {
  /** Called on Enter with the trimmed query. */
  onSearch: (query: string) => void
  placeholder?: string
  label?: string
  defaultValue?: string
  className?: string
}

/** Figma `Search` in topHeader: input S (36px), 272px, search icon on the left. */
export function HeaderSearch({
  onSearch,
  placeholder = "Номер заявки, ИНН или ФИО",
  label = "Поиск",
  defaultValue,
  className,
}: HeaderSearchProps) {
  const id = useId()
  return (
    <form
      role="search"
      className={cn("relative w-68", className)}
      onSubmit={(event) => {
        event.preventDefault()
        const query = new FormData(event.currentTarget).get("q")
        onSearch(String(query ?? "").trim())
      }}
    >
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-5 -translate-y-1/2 text-muted-foreground" />
      <Input id={id} name="q" type="search" size="sm" placeholder={placeholder} defaultValue={defaultValue} className="pl-9" />
    </form>
  )
}
