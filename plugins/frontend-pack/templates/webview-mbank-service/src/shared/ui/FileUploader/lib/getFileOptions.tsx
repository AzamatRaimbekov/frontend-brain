import { TFunction } from 'i18next'
import { Delete } from 'md-glyphs'

export const getFileOptions = (
  fileId: number,
  t: TFunction,
  handleRemove?: (id: number) => void,
) => {
  const options = []

  if (handleRemove) {
    options.push({
      title: (
        <div className="flex items-center gap-x-3 text-base font-medium text-destructive">
          <Delete
            size={24}
            color="var(--color-destructive)"
          />
          {t('delete')}
        </div>
      ),
      action: () => handleRemove(fileId),
    })
  }

  return options
}
