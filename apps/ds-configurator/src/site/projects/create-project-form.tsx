// New project on the Mbank base: name, id (from the name by default), brand, token prefix.
// The write key comes back once; it is saved in this browser and shown on the Figma tab.
import { useState, type FormEvent } from "react"

import { Button } from "@/generated/kit/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/generated/kit/ui/card"
import { Input } from "@/generated/kit/ui/input"
import { Label } from "@/generated/kit/ui/label"
import { MBANK_BRANDS } from "@/lib/mbank"

import { slug } from "../../../server/validate"
import { ErrorAlert } from "../error-alert"
import { useCreateProject } from "../queries"
import { hrefOf } from "../router"

export function CreateProjectForm() {
  const create = useCreateProject()
  const [name, setName] = useState("")
  const [id, setId] = useState("")
  const [brand, setBrand] = useState(MBANK_BRANDS[0])
  const [prefix, setPrefix] = useState("mb")
  const autoId = slug(name)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    create.mutate(
      { name: name.trim(), id: id.trim() || autoId, brand, prefix: prefix.trim() },
      { onSuccess: (r) => { window.location.hash = hrefOf({ page: "project", id: r.project.id, tab: "figma" }) } }
    )
  }

  return (
    <Card className="self-start">
      <CardHeader>
        <CardTitle>Новый проект</CardTitle>
        <CardDescription>Старт — токены Mbank. Дальше правите значения и добавляете свои.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="grid gap-3" noValidate>
          <div className="grid gap-1.5">
            <Label htmlFor="p-name">Название</Label>
            <Input id="p-name" size="sm" value={name} onChange={(e) => setName(e.target.value)} placeholder="Кредитный конвейер" required />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="p-id">Идентификатор (в адресах)</Label>
            <Input id="p-id" size="sm" className="font-mono" value={id} onChange={(e) => setId(e.target.value)} placeholder={autoId || "credit-crm"} spellCheck={false} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="grid gap-1.5">
              <Label htmlFor="p-brand">Бренд Mbank</Label>
              <select
                id="p-brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                {MBANK_BRANDS.map((b) => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="p-prefix">Префикс своих токенов</Label>
              <Input id="p-prefix" size="sm" className="font-mono" value={prefix} onChange={(e) => setPrefix(e.target.value)} spellCheck={false} />
            </div>
          </div>
          <ErrorAlert error={create.error} />
          <Button type="submit" variant="brand" size="sm" disabled={!name.trim() || create.isPending}>
            {create.isPending ? "Создаю…" : "Создать проект"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
