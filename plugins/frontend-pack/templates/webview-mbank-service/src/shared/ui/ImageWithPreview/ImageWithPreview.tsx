import { CSSProperties, useEffect, useRef, useState } from 'react'

interface Props {
  withBlur?: boolean
  src?: string
  className?: string
  width?: number
  height?: number
  alt?: string
  style?: CSSProperties
  animation?: boolean
}

export const ImageWithPreview = ({
  src,
  withBlur,
  className = '',
  alt = '',
  animation = true,
  width,
  height,
  style,
  ...props
}: Props) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const handleLoad = () => {
      setIsLoaded(true)
    }

    const img = imageRef.current
    if (img?.complete) {
      handleLoad()
    } else {
      img?.addEventListener('load', handleLoad)
    }

    return () => img?.removeEventListener('load', handleLoad)
  }, [])

  return (
    <div
      className="relative"
      style={{ width, height }}
    >
      {withBlur && !isLoaded && (
        <div
          className={`absolute inset-0 animate-pulse bg-gray-200 ${className}`}
          style={{ width, height }}
        />
      )}
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        className={`${animation ? 'transition-opacity duration-500 ease-in-out' : ''} ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        style={style}
        width={width}
        height={height}
        {...props}
      />
    </div>
  )
}
