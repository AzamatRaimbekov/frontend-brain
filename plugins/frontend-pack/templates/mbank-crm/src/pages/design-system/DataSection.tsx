import { useState } from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/ui/accordion'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { BreadcrumbItem } from '@/shared/ui/breadcrumb-item'
import { Pagination } from '@/shared/ui/pagination'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { Badge } from '@/shared/ui/badge'
import { Demo, Section } from './Section'

const ROWS = [
  { id: 'CL-240131', name: 'Абдыкадыров Эрлан', amount: '120 000 KGS', status: ['SLA 12 мин', 'info'] },
  { id: 'CL-240126', name: 'Жумабекова Нургуль', amount: '300 000 KGS', status: ['SLA 4 мин', 'warning'] },
  { id: 'CL-240127', name: 'Осмонов Тилек', amount: '60 000 KGS', status: ['Просрочено 7 мин', 'error'] },
  { id: 'CL-240088', name: 'Назарова Элеонора', amount: '250 000 KGS', status: ['Одобрена', 'success'] },
] as const

export function DataSection() {
  const [page, setPage] = useState(3)
  return (
    <Section id="data" title="Навигация и данные">
      <div className="grid gap-4 lg:grid-cols-2">
        <Demo title="Tabs, Breadcrumb">
          <Tabs defaultValue="today">
            <TabsList>
              <TabsTrigger value="today">Сегодня</TabsTrigger>
              <TabsTrigger value="week">Неделя</TabsTrigger>
              <TabsTrigger value="month">Месяц</TabsTrigger>
            </TabsList>
          </Tabs>
          <nav aria-label="Хлебные крошки">
            <ol className="flex flex-wrap items-center gap-1">
              <BreadcrumbItem label="Кредиты" href="#" />
              <BreadcrumbItem label="На андеррайтинге" href="#" />
              <BreadcrumbItem label="CL-240131" current />
            </ol>
          </nav>
        </Demo>
        <Demo title="Avatar, Accordion">
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarFallback>БТ</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>АЭ</AvatarFallback>
            </Avatar>
          </div>
          <Accordion type="single" collapsible defaultValue="income">
            <AccordionItem value="income">
              <AccordionTrigger>Доходы клиента</AccordionTrigger>
              <AccordionContent>Зарплата 85 000 KGS, подтверждена выпиской.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="debts">
              <AccordionTrigger>Кредитная история</AccordionTrigger>
              <AccordionContent>2 закрытых кредита, просрочек нет.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </Demo>
      </div>
      <Demo title="Table, Pagination">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Заявка</TableHead>
              <TableHead>Клиент</TableHead>
              <TableHead className="text-right">Сумма</TableHead>
              <TableHead>Статус</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ROWS.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="tabular-nums">{row.id}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell className="text-right tabular-nums">{row.amount}</TableCell>
                <TableCell>
                  <Badge tone={row.status[1]}>{row.status[0]}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Pagination page={page} pageCount={12} onPageChange={setPage} summary="41–60 из 240" />
      </Demo>
    </Section>
  )
}
