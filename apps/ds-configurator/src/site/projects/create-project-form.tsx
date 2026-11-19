// New project on the standard shadcn tokens: name and id (from the name by default).
// The write key comes back once; it is saved in this browser and shown on the Figma tab.
import { useState, type FormEvent } from "react"

import { Button } from "@/kit/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/kit/ui/card"
import { Input } from "@/kit/ui/input"
import { Label } from "@/kit/ui/label"

import { slug } from "../../../server/validate"
import { ErrorAlert } from "../error-alert"
import { useCreateProject } from "../queries"
import { hrefOf } from "../router"

export function CreateProjectForm() {
  const create = useCreateProject()
  const [name, setName] = useState("")
  const [id, setId] = useState("")
  const autoId = slug(name)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    create.mutate(
      { name: name.trim(), id: id.trim() || autoId },
      { onSuccess: (r) => { window.location.hash = hrefOf({ page: "project", id: r.project.id, tab: "tokens" }) } }
    )
  }

  return (
    <Card className="self-start">
      <CardHeader>
        <CardTitle>Новый проект</CardTitle>
        <CardDescription>Старт — стандартные токены shadcn (neutral). Дальше меняете их значения.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="grid gap-3" noValidate>
          <div className="grid gap-1.5">
            <Label htmlFor="p-name">Название</Label>
            <Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Кредитный конвейер" required />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="p-id">Идентификатор (в адресах)</Label>
            <Input id="p-id" className="font-mono" value={id} onChange={(e) => setId(e.target.value)} placeholder={autoId || "credit-crm"} spellCheck={false} />
          </div>
          <ErrorAlert error={create.error} />
          <Button type="submit" disabled={!name.trim() || create.isPending}>
            {create.isPending ? "Создаю…" : "Создать проект"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
