import './HTMLParse.css'

interface HTMLParseProps {
  content: string
  className?: string
}
export function HTMLParse({ content, className }: HTMLParseProps) {
  return (
    <div
      className={`break-all', ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
