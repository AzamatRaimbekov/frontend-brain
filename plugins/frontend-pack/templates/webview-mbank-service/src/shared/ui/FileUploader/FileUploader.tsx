import { cn } from '@shared/libs/cn'
import { Button } from '@shared/ui/Button'
import { Spinner } from '@shared/ui/base/spinner'
import { AddFile, Cross, File as FileIcon } from 'md-glyphs'

import { ChangeEvent, useId, useRef } from 'react'

export interface FileUploaderFile {
  id: string | number
  name: string
  previewUrl?: string
  url?: string
  disabled?: boolean
}

export interface FileUploaderProps {
  accept?: string
  className?: string
  description?: string
  disabled?: boolean
  files?: FileUploaderFile[]
  loading?: boolean
  maxFiles?: number
  multiple?: boolean
  onDownload?: (file: FileUploaderFile) => void
  onFilesSelected?: (files: File[]) => void | Promise<void>
  onRemove?: (file: FileUploaderFile) => void | Promise<void>
  title?: string
  uploadLabel?: string
}

const isImage = (file: FileUploaderFile) =>
  Boolean(file.previewUrl?.match(/\.(png|jpe?g|webp|gif|avif)(\?.*)?$/i)) ||
  Boolean(file.previewUrl?.startsWith('data:image/')) ||
  Boolean(file.previewUrl?.startsWith('blob:'))

export function FileUploader({
  accept,
  className,
  description,
  disabled = false,
  files = [],
  loading = false,
  maxFiles,
  multiple = true,
  onDownload,
  onFilesSelected,
  onRemove,
  title,
  uploadLabel = 'Загрузить документы',
}: FileUploaderProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const canUploadMore = !maxFiles || files.length < maxFiles
  const isDisabled = disabled || loading
  const hasFiles = files.length > 0

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? [])

    if (selectedFiles.length) void onFilesSelected?.(selectedFiles)
    event.target.value = ''
  }

  return (
    <section className={cn('rounded-[28px] bg-card p-4 sm:p-6', className)}>
      {(title || description) && (
        <div className="mb-5">
          {title && (
            <h3 className="text-[17px] leading-[22px] font-bold text-foreground">
              {title}
            </h3>
          )}
          {description && (
            <p className="mt-1 text-[15px] leading-5 font-normal tracking-[-0.2px] text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      )}

      <input
        accept={accept}
        className="sr-only"
        disabled={isDisabled || !canUploadMore}
        id={inputId}
        multiple={multiple}
        onChange={handleFileChange}
        ref={inputRef}
        type="file"
      />

      {!hasFiles && canUploadMore && (
        <label
          className={cn(
            'flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-[20px] bg-secondary px-4 text-[17px] leading-[22px] font-bold text-primary transition-opacity',
            isDisabled && 'pointer-events-none opacity-50',
          )}
          htmlFor={inputId}
        >
          {loading ? <Spinner className="size-5" /> : <AddFile size={28} />}
          <span>{uploadLabel}</span>
        </label>
      )}

      {hasFiles && (
        <div className="flex flex-wrap items-center gap-2">
          {canUploadMore && (
            <Button
              aria-label={uploadLabel}
              className="size-12 min-w-12 px-0"
              disabled={isDisabled}
              onClick={() => inputRef.current?.click()}
              size="md"
              title={uploadLabel}
              variant="secondary"
            >
              {loading ? <Spinner className="size-5" /> : <AddFile size={28} />}
            </Button>
          )}

          {files.map((file) => {
            const preview = file.previewUrl ?? file.url
            const fileIsDisabled = isDisabled || file.disabled

            return (
              <div
                className={cn(
                  'group relative size-12 overflow-visible rounded-[20px]',
                  fileIsDisabled && 'opacity-50',
                )}
                key={file.id}
              >
                {preview && isImage(file) ? (
                  <img
                    alt={file.name}
                    className="size-full rounded-[20px] object-cover"
                    src={preview}
                  />
                ) : (
                  <div className="flex size-full items-center justify-center rounded-[20px] bg-secondary text-primary">
                    <FileIcon size={32} />
                  </div>
                )}

                {file.url && (
                  <a
                    aria-label={`Скачать ${file.name}`}
                    className="absolute inset-0 flex items-center justify-center rounded-[20px] bg-black/35 text-white opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
                    download
                    href={file.url}
                    onClick={() => onDownload?.(file)}
                    rel="noreferrer"
                    target="_blank"
                    title={`Скачать ${file.name}`}
                  >
                    <FileIcon size={28} />
                  </a>
                )}

                {onRemove && (
                  <button
                    aria-label={`Удалить ${file.name}`}
                    className="absolute -top-1.5 -right-1.5 flex size-6 items-center justify-center rounded-full bg-destructive text-white disabled:pointer-events-none"
                    disabled={fileIsDisabled}
                    onClick={() => void onRemove(file)}
                    title={`Удалить ${file.name}`}
                    type="button"
                  >
                    <Cross size={14} />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
