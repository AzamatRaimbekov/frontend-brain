import { cn } from '@shared/libs/cn'

import { Button, ButtonProps } from '../Button'

type FileUploaderButtonProps = ButtonProps

const FileUploaderButton = ({
  children,
  className,
  ...props
}: FileUploaderButtonProps) => {
  return (
    <>
      <Button
        className={cn(
          'h-11 rounded-[14px] border-0 bg-secondary text-base font-bold text-primary shadow-none',
          className,
        )}
        {...props}
      >
        {children}
      </Button>
    </>
  )
}

export default FileUploaderButton
