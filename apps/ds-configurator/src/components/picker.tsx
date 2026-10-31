// Forked from shadcn-ui/ui apps/v4/app/(app)/(create)/components/picker.tsx (MIT), see NOTICE.md.
// Trimmed to the parts the configurator uses; IconPlaceholder replaced by the kit CheckIcon,
// neutral-* palette classes replaced by Mbank token utilities (surface-inverse, inverse-foreground).
import * as React from "react"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"

import { CheckIcon } from "@/generated/kit/ui/icons"
import { cn } from "@/generated/kit/lib/utils"

function Picker(props: MenuPrimitive.Root.Props) {
  return <MenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function PickerTrigger({ className, ...props }: MenuPrimitive.Trigger.Props) {
  return (
    <MenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      className={cn(
        "relative w-full shrink-0 touch-manipulation rounded-md px-2.5 py-2 text-left ring-1 ring-border select-none hover:bg-muted focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50 data-popup-open:bg-muted",
        className
      )}
      {...props}
    />
  )
}

function PickerContent({
  align = "start",
  side = "right",
  sideOffset = 12,
  className,
  ...props
}: MenuPrimitive.Popup.Props & Pick<MenuPrimitive.Positioner.Props, "align" | "side" | "sideOffset">) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner className="isolate z-50 outline-none" align={align} side={side} sideOffset={sideOffset}>
        <MenuPrimitive.Popup
          data-slot="dropdown-menu-content"
          className={cn(
            "z-50 max-h-(--available-height) w-56 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-surface-inverse p-1.5 text-inverse-foreground shadow-dropdown outline-none",
            className
          )}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  )
}

function PickerGroup(props: MenuPrimitive.Group.Props) {
  return <MenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
}

function PickerLabel({ className, ...props }: MenuPrimitive.GroupLabel.Props) {
  return (
    <MenuPrimitive.GroupLabel
      data-slot="dropdown-menu-label"
      className={cn("px-2 py-1.5 text-caption font-medium text-disabled-foreground", className)}
      {...props}
    />
  )
}

// Lets pickers preview an item's value on hover/highlight by declaring a
// single onItemPreview on the group instead of wiring every radio item.
const PickerPreviewContext = React.createContext<((value: string) => void) | null>(null)

function PickerRadioGroup({
  onItemPreview,
  ...props
}: MenuPrimitive.RadioGroup.Props & { onItemPreview?: (value: string) => void }) {
  return (
    <PickerPreviewContext.Provider value={onItemPreview ?? null}>
      <MenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />
    </PickerPreviewContext.Provider>
  )
}

function PickerRadioItem({ className, children, value, onMouseMove, onFocus, ...props }: MenuPrimitive.RadioItem.Props) {
  const onItemPreview = React.useContext(PickerPreviewContext)
  return (
    <MenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      value={value}
      onMouseMove={(event) => {
        onMouseMove?.(event)
        onItemPreview?.(value as string)
      }}
      onFocus={(event) => {
        onFocus?.(event)
        onItemPreview?.(value as string)
      }}
      className={cn(
        "relative flex cursor-default items-center gap-2 rounded-md py-1.5 pr-8 pl-2 text-sm font-medium outline-hidden select-none focus:bg-surface-6 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute right-2 flex items-center justify-center">
        <MenuPrimitive.RadioItemIndicator>
          <CheckIcon className="size-4" />
        </MenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </MenuPrimitive.RadioItem>
  )
}

function PickerSeparator({ className, ...props }: MenuPrimitive.Separator.Props) {
  return (
    <MenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("-mx-1.5 my-1.5 h-px bg-surface-6", className)}
      {...props}
    />
  )
}

export { Picker, PickerTrigger, PickerContent, PickerGroup, PickerLabel, PickerRadioGroup, PickerRadioItem, PickerSeparator }
