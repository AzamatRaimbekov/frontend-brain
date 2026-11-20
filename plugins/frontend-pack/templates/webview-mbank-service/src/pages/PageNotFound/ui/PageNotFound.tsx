interface PageNotFoundProps {
  subtitle?: string
}
export default function PageNotFound({
  subtitle = 'Страница не найдена',
}: PageNotFoundProps) {
  return (
    <div className="flex h-fit min-h-dvh flex-col items-center justify-center">
      <div className="text-[100px] font-bold text-foreground">404</div>
      <h3 className="text-xl font-bold text-foreground">{subtitle}</h3>
    </div>
  )
}
