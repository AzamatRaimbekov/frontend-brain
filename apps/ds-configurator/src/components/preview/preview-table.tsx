import { Badge } from "@/generated/kit/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/generated/kit/ui/table"

const ROWS = [
  { id: "TX-1042", name: "Кафе Navat", amount: "−1 250 с", status: "success" as const, label: "Проведён" },
  { id: "TX-1043", name: "Пополнение с карты", amount: "+15 000 с", status: "info" as const, label: "В обработке" },
  { id: "TX-1044", name: "Оплата Megacom", amount: "−300 с", status: "error" as const, label: "Отклонён" },
]

export function PreviewTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Операция</TableHead>
          <TableHead>Получатель</TableHead>
          <TableHead className="text-right">Сумма</TableHead>
          <TableHead>Статус</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ROWS.map((r) => (
          <TableRow key={r.id}>
            <TableCell className="text-muted-foreground">{r.id}</TableCell>
            <TableCell>{r.name}</TableCell>
            <TableCell className="text-right tabular-nums">{r.amount}</TableCell>
            <TableCell>
              <Badge tone={r.status}>{r.label}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
