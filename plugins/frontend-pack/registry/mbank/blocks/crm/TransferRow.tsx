import type * as React from "react"

import { cn } from "@/shared/lib/utils"
import { Badge } from "@/shared/ui/badge"
import { TableCell, TableRow } from "@/shared/ui/table"

type BadgeTone = React.ComponentProps<typeof Badge>["tone"]

export type Transfer = {
  /** "TR-80421951". */
  id: string
  /** Already formatted: "12.10.2026, 14:32". */
  dateTime: string
  sender: string
  recipient: string
  country: string
  /** Already formatted: "185 000 KGS". */
  amount: string
  /** "Приложение", "Интернет-банк". */
  channel: string
  /** { label: "Успешно", tone: "success" } — Figma Badge-status S rounded. */
  status: { label: string; tone: BadgeTone }
}

type TransferRowProps = {
  transfer: Transfer
  /** Opens the transfer card (Карточка перевода): the row becomes keyboard-focusable. */
  onOpen?: (id: string) => void
  className?: string
}

/* Figma TableCell: px 12, 44px row, body/s, right divider border/divider/primary. */
const cell = "border-r border-border"

/**
 * Figma `CRM / Transfer row` (contract crm-transfer-row), the row of «Все переводы»: 8 cells
 * (ID, Дата и время, Отправитель, Получатель, Страна, Сумма, Канал, Статус), background surface,
 * bottom divider. Put it in <Table><TableBody>; the header row is TableHead cells with the same titles.
 */
export function TransferRow({ transfer: t, onOpen, className }: TransferRowProps) {
  const onKeyDown = (e: React.KeyboardEvent<HTMLTableRowElement>) => {
    if (e.key !== "Enter" && e.key !== " ") return
    e.preventDefault()
    onOpen?.(t.id)
  }
  return (
    <TableRow
      data-slot="transfer-row"
      tabIndex={onOpen ? 0 : undefined}
      onClick={onOpen && (() => onOpen(t.id))}
      onKeyDown={onOpen && onKeyDown}
      className={cn("bg-background", onOpen && "cursor-pointer focus-visible:bg-surface-1 focus-visible:outline-none", className)}
    >
      <TableCell data-slot="transfer-row-id-cell" className={cell}>
        {t.id}
      </TableCell>
      <TableCell data-slot="transfer-row-date-cell" className={cell}>
        {t.dateTime}
      </TableCell>
      <TableCell data-slot="transfer-row-sender-cell" className={cell}>
        {t.sender}
      </TableCell>
      <TableCell data-slot="transfer-row-recipient-cell" className={cell}>
        {t.recipient}
      </TableCell>
      <TableCell data-slot="transfer-row-country-cell" className={cell}>
        {t.country}
      </TableCell>
      <TableCell data-slot="transfer-row-amount-cell" className={cell}>
        {t.amount}
      </TableCell>
      <TableCell data-slot="transfer-row-channel-cell" className={cell}>
        {t.channel}
      </TableCell>
      <TableCell data-slot="transfer-row-status-cell" className={cell}>
        <Badge data-slot="transfer-row-status" size="sm" tone={t.status.tone}>
          {t.status.label}
        </Badge>
      </TableCell>
    </TableRow>
  )
}
