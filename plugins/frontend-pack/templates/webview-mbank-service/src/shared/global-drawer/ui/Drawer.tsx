import { useAppSelector, useDynamicModuleLoader } from '@shared/hooks/useRedux'
import { cn } from '@shared/libs/cn'
import {
  Drawer,
  DrawerBackdrop,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerPortal,
  DrawerTitle,
  DrawerViewport,
  DrawerVirtualKeyboardProvider,
} from '@shared/ui/base/drawer'

import { type CSSProperties, type ReactNode, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import { useGlobalDrawer } from '../hooks/useGlobalDrawer'
import { globalDrawerSliceReducer } from '../model/global-drawer-slice'

export default function GlobalDrawer() {
  const { pathname } = useLocation()

  useDynamicModuleLoader({
    reducers: {
      globalDrawer: globalDrawerSliceReducer,
    },
  })

  const { closeDrawer } = useGlobalDrawer()

  const drawer = useAppSelector((s) => s?.globalDrawer)
  const body = drawer?.body
  const legacyProps = drawer?.props

  useEffect(() => {
    closeDrawer()
  }, [pathname, closeDrawer])

  return (
    <Drawer
      {...drawer?.rootProps}
      open={!!body}
      swipeDirection="down"
      disablePointerDismissal={
        drawer?.closeOnMaskClick === false ||
        legacyProps?.closeOnMaskClick === false
      }
      onOpenChange={(open) => {
        if (!open) {
          closeDrawer()
        }
      }}
    >
      <DrawerVirtualKeyboardProvider>
        <DrawerPortal>
          <DrawerBackdrop className={drawer?.backdropClassName} />
          <DrawerViewportWithContent
            bodyClassName={drawer?.bodyClassName}
            contentClassName={cn(
              legacyProps?.className,
              drawer?.contentClassName,
            )}
            contentStyle={drawer?.contentStyle ?? legacyProps?.bodyStyle}
            description={drawer?.description}
            showHandle={drawer?.showHandle}
            title={drawer?.title}
          >
            {body}
          </DrawerViewportWithContent>
        </DrawerPortal>
      </DrawerVirtualKeyboardProvider>
    </Drawer>
  )
}

interface DrawerViewportWithContentProps {
  bodyClassName?: string
  children: ReactNode
  contentClassName?: string
  contentStyle?: CSSProperties
  description?: string
  showHandle?: boolean
  title?: string
}

function DrawerViewportWithContent({
  bodyClassName,
  children,
  contentClassName,
  contentStyle,
  description,
  showHandle,
  title,
}: DrawerViewportWithContentProps) {
  return (
    <DrawerViewport>
      <DrawerContent
        className={contentClassName}
        showHandle={showHandle}
        style={contentStyle}
      >
        <DrawerTitle className="sr-only">{title || 'Drawer'}</DrawerTitle>
        {description && (
          <DrawerDescription className="sr-only">
            {description}
          </DrawerDescription>
        )}
        <DrawerBody className={bodyClassName}>{children}</DrawerBody>
      </DrawerContent>
    </DrawerViewport>
  )
}
