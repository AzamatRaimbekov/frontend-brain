// Standard shadcn/ui components (src/kit) restyled by the selected tokens.
import { Alert, AlertDescription, AlertTitle } from "@/kit/ui/alert"
import { Avatar, AvatarFallback } from "@/kit/ui/avatar"
import { Badge } from "@/kit/ui/badge"
import { Button } from "@/kit/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/kit/ui/card"
import { Checkbox } from "@/kit/ui/checkbox"
import { InfoIcon } from "@/kit/ui/icons"
import { Input } from "@/kit/ui/input"
import { Label } from "@/kit/ui/label"
import { Skeleton } from "@/kit/ui/skeleton"
import { Switch } from "@/kit/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/kit/ui/tabs"

import { ChartBars } from "./chart-bars"
import { PreviewTable } from "./preview-table"

const BUTTONS = ["default", "secondary", "outline", "ghost", "destructive", "link"] as const
const BADGES = ["default", "secondary", "outline", "destructive"] as const

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
        {BADGES.map((v) => (
          <Badge key={v} variant={v}>
            {v}
          </Badge>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              <h3>Новый платёж</h3>
            </CardTitle>
            <CardDescription>Перевод по номеру телефона</CardDescription>
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
            <Button>Отправить</Button>
            <Button variant="ghost">Отмена</Button>
          </CardFooter>
        </Card>
        <div className="grid content-start gap-4">
          <Alert>
            <InfoIcon />
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
          <ChartBars />
        </div>
      </div>
      <PreviewTable />
    </div>
  )
}
