import { Drawer as DrawerPrimitive } from '@base-ui/react/drawer'
import { cn } from '@shared/libs/cn'

import type { ComponentProps } from 'react'

type DrawerBackdropProps = Omit<
  ComponentProps<typeof DrawerPrimitive.Backdrop>,
  'className'
> & {
  className?: string
}

type DrawerViewportProps = Omit<
  ComponentProps<typeof DrawerPrimitive.Viewport>,
  'className'
> & {
  className?: string
}

type DrawerContentProps = Omit<
  ComponentProps<typeof DrawerPrimitive.Popup>,
  'className'
> & {
  className?: string
  showHandle?: boolean
}

type DrawerBodyProps = Omit<
  ComponentProps<typeof DrawerPrimitive.Content>,
  'className'
> & {
  className?: string
}

const Drawer = DrawerPrimitive.Root
const DrawerTrigger = DrawerPrimitive.Trigger
const DrawerPortal = DrawerPrimitive.Portal
const DrawerTitle = DrawerPrimitive.Title
const DrawerDescription = DrawerPrimitive.Description
const DrawerClose = DrawerPrimitive.Close
const DrawerVirtualKeyboardProvider = DrawerPrimitive.VirtualKeyboardProvider
const createDrawerHandle = DrawerPrimitive.createHandle

function DrawerBackdrop({ className, ...props }: DrawerBackdropProps) {
  return (
    <DrawerPrimitive.Backdrop
      data-slot="drawer-backdrop"
      className={cn(
        'fixed inset-0 z-[90] min-h-dvh bg-overlay opacity-[calc(var(--backdrop-opacity)*(1-var(--drawer-swipe-progress)))] transition-opacity duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] [--backdrop-opacity:0.4] data-ending-style:opacity-0 data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] data-starting-style:opacity-0 data-swiping:duration-0 supports-[-webkit-touch-callout:none]:absolute',
        className,
      )}
      {...props}
    />
  )
}

function DrawerViewport({ className, ...props }: DrawerViewportProps) {
  return (
    <DrawerPrimitive.Viewport
      data-slot="drawer-viewport"
      className={cn(
        'fixed inset-0 z-[100] flex touch-none items-end justify-center overflow-hidden',
        className,
      )}
      {...props}
    />
  )
}

function DrawerHandle({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'mx-auto mt-2 h-1 w-12 shrink-0 rounded-full bg-border-strong',
        className,
      )}
    />
  )
}

function DrawerContent({
  className,
  children,
  showHandle = true,
  ...props
}: DrawerContentProps) {
  return (
    <DrawerPrimitive.Popup
      data-slot="drawer-content"
      initialFocus={false}
      className={cn(
        'fixed right-0 bottom-0 left-0 z-[101] flex max-h-[calc(100dvh-12px)] min-h-[100px] [transform:translateY(var(--drawer-swipe-movement-y))] touch-none flex-col overflow-hidden rounded-t-[20px] bg-card text-foreground shadow-lg transition-[transform,box-shadow] duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform outline-none [--bleed:0px] data-ending-style:[transform:translateY(calc(100%+2px))] data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] data-starting-style:[transform:translateY(calc(100%+2px))] data-swiping:select-none',
        className,
      )}
      {...props}
    >
      {showHandle && <DrawerHandle />}
      {children}
    </DrawerPrimitive.Popup>
  )
}

function DrawerBody({ className, ...props }: DrawerBodyProps) {
  return (
    <DrawerPrimitive.Content
      data-slot="drawer-body"
      className={cn(
        'min-h-0 flex-1 touch-auto overflow-y-auto overscroll-contain pb-[calc(env(safe-area-inset-bottom,0px)+var(--drawer-keyboard-inset,0px))]',
        className,
      )}
      {...props}
    />
  )
}

export {
  Drawer,
  DrawerBackdrop,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHandle,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
  DrawerViewport,
  DrawerVirtualKeyboardProvider,
  createDrawerHandle,
}
