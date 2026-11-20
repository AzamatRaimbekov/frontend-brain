import { Button } from '@/shared/ui/button'
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from '@/shared/ui/alert-dialog'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/shared/ui/sheet'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { Demo, Section } from './Section'

/** Overlays open on click: the trigger row shows every overlay of the kit. */
export function OverlaysSection() {
  return (
    <Section id="overlays" title="Оверлеи">
      <Demo title="Dialog, AlertDialog, Sheet, Popover, Tooltip, DropdownMenu">
        <div className="flex flex-wrap items-center gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Запросить документы</DialogTitle>
                <DialogDescription>Клиент получит SMS со списком документов.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button>Запросить</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">AlertDialog</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Отказать по заявке CL-240131?</AlertDialogTitle>
                <AlertDialogDescription>Клиент получит уведомление, отменить нельзя.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <Button variant="destructive">Отказать</Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Sheet</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Фильтры</SheetTitle>
                <SheetDescription>Продукт, сумма и этап.</SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Popover</Button>
            </PopoverTrigger>
            <PopoverContent>SLA этапа: 4 часа с момента поступления.</PopoverContent>
          </Popover>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost">Tooltip</Button>
            </TooltipTrigger>
            <TooltipContent>Экспорт в Excel</TooltipContent>
          </Tooltip>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary">DropdownMenu</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Экспорт</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Excel</DropdownMenuItem>
              <DropdownMenuItem>PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Demo>
    </Section>
  )
}
