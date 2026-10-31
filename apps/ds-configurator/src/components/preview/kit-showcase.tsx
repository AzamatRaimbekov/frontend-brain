// The real Mbank kit (copied from frontend-pack at prebuild) restyled by the selected tokens.
import { Alert, AlertDescription, AlertTitle } from "@/generated/kit/ui/alert"
import { Avatar, AvatarFallback } from "@/generated/kit/ui/avatar"
import { Badge } from "@/generated/kit/ui/badge"
import { Button } from "@/generated/kit/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/generated/kit/ui/card"
import { Checkbox } from "@/generated/kit/ui/checkbox"
import { Input } from "@/generated/kit/ui/input"
import { Label } from "@/generated/kit/ui/label"
import { Skeleton } from "@/generated/kit/ui/skeleton"
import { Switch } from "@/generated/kit/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/generated/kit/ui/tabs"

import { PreviewTable } from "./preview-table"

const BUTTONS = ["primary", "brand", "secondary", "soft", "outline", "ghost", "destructive"] as const
const TONES = ["neutral", "accent", "success", "warning", "error", "info"] as const

export function KitShowcase() {
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap gap-2">
        {BUTTONS.map((v) => (
          <Button key={v} variant={v} size="sm">
            {v}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {TONES.map((t) => (
          <Badge key={t} tone={t}>
            {t}
          </Badge>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              <h3>Перевод по номеру</h3>
            </CardTitle>
            <CardDescription>Комиссия 0 сом до 15 000 в месяц</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="preview-phone">Телефон получателя</Label>
              <Input id="preview-phone" placeholder="+996 555 123 456" />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="preview-save" defaultChecked />
              <Label htmlFor="preview-save">Сохранить в шаблоны</Label>
            </div>
          </CardContent>
          <CardFooter className="gap-2">
            <Button variant="brand">Перевести</Button>
            <Button variant="ghost">Отмена</Button>
          </CardFooter>
        </Card>
        <div className="grid content-start gap-4">
          <Alert tone="info">
            <AlertTitle>Новый тариф</AlertTitle>
            <AlertDescription>С 1 ноября переводы внутри банка бесплатные.</AlertDescription>
          </Alert>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">Все</TabsTrigger>
              <TabsTrigger value="in">Пополнения</TabsTrigger>
              <TabsTrigger value="out">Списания</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="flex items-center gap-3 pt-3">
              <Avatar>
                <AvatarFallback>АР</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 gap-1.5">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Switch defaultChecked aria-label="Уведомления" />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <PreviewTable />
    </div>
  )
}
