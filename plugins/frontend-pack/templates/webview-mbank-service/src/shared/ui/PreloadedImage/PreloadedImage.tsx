import { cn } from '@shared/libs/cn'
import { Skeleton } from '@shared/ui/base/skeleton'

import { ComponentProps, useState } from 'react'

interface PreloadedImageProps extends ComponentProps<'img'> {
  containerClass?: string
}
export const PreloadedImage = ({
  src,
  alt,
  className,
  containerClass,
  ...rest
}: PreloadedImageProps) => {
  const [loaded, setLoaded] = useState(false)

  return (
    <div
      className={cn('relative h-full w-full overflow-hidden', containerClass)}
    >
      {!loaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
          <Skeleton className="h-full w-full rounded-none" />
        </div>
      )}
      <img
        loading="eager"
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={cn(
          'h-full w-full object-cover object-center transition-opacity duration-500',
          loaded ? 'opacity-100' : 'opacity-0',
          className,
        )}
        {...rest}
      />
    </div>
  )
}
