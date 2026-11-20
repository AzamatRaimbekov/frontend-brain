import { getFileTypeUrl } from '@shared/libs/getFileTypeUrl'
import { PreloadedImage } from '@shared/ui/PreloadedImage'
import { File, FileExcel, FilePdf, FileTxt, FileWord } from 'md-glyphs'

export const imageFormats = ['png', 'jpeg', 'jpg']

export const isFileImage = (value: string) =>
  imageFormats.includes(value.toLowerCase())

export const getFileIcon = (link: string) => {
  const fileType = getFileTypeUrl(link)

  if (isFileImage(fileType)) {
    return (
      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-muted">
        <PreloadedImage
          alt="file"
          className="h-full w-full object-contain object-center"
          src={link}
          width={48}
          height={48}
        />
      </div>
    )
  }

  switch (fileType) {
    case 'PDF':
      return (
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
          <FilePdf
            size={36}
            color="var(--color-gray-500)"
          />
        </div>
      )
    case 'DOC':
    case 'DOCX':
      return (
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
          <FileWord
            size={36}
            color="var(--color-gray-500)"
          />
        </div>
      )
    case 'TXT':
      return (
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
          <FileTxt
            size={36}
            color="var(--color-gray-500)"
          />
        </div>
      )
    case 'XLS':
    case 'XLSX':
    case 'XLSM':
      return (
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
          <FileExcel
            size={36}
            color="var(--color-gray-500)"
          />
        </div>
      )
    default:
      break
  }

  return <File size={36} />
}
