import { cn } from '@shared/libs/cn'
import { Cross } from 'md-glyphs'

import { getFileIcon } from './lib'
import { BidFile } from './types'

interface FileItemProps {
  item: BidFile
  handleRemove?: (id: number) => void
  isDisabledUpload: boolean
  isDeletingLoading: boolean
}
export const FileItem = ({
  item,
  handleRemove,
  isDisabledUpload,
  isDeletingLoading,
}: FileItemProps) => {
  // const options = getFileOptions(item.id, t, handleRemove)
  // const fileName = decodeURIValue(item.file)
  const icon = getFileIcon(item.file)

  const handleRemoveClick = () => {
    if (isDeletingLoading || isDisabledUpload) return
    handleRemove?.(item.id)
  }

  return (
    <div
      className={cn('flex items-center gap-2 rounded-2xl', {
        'opacity-50': isDisabledUpload,
      })}
    >
      <div className="relative">
        <div className="place-items-center content-center overflow-hidden rounded-2xl">
          {icon}
        </div>
        <button
          type="button"
          disabled={isDeletingLoading}
          onClick={handleRemoveClick}
          className="absolute -top-1 -right-1 flex h-4 w-4 cursor-pointer items-center justify-center rounded-full bg-destructive"
        >
          <Cross
            size={12}
            color="#FFFFFF"
            className="cursor-pointer"
          />
        </button>
      </div>
      {/* <div className="flex min-w-0 flex-1/2 flex-col gap-y-1">
        <div className="truncate text-base text-ellipsis text-foreground">
          {fileName}
        </div>#27282D99
      </div> */}
      {/* <OptionDrawer options={options}>
        <Button
          type="link"
          className="h-fit w-fit"
          disabled={isDisabledUpload}
          icon={
            <Icon
              name="meatBallMenu"
              size={24}
              color="var(--color-input)"
            />
          }
        />
      </OptionDrawer> */}
    </div>
  )
}
