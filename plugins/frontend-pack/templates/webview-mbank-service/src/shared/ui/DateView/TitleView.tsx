type TitleSize = 'middle' | 'small' | 'large'

interface TitleViewProps {
  data: {
    label: string
    value: string
    size?: TitleSize
    className?: string
  }[]
}

export function TitleView({ data }: TitleViewProps) {
  return (
    <div className="flex gap-2">
      {data?.map((item) => {
        return (
          <div
            key={item.value}
            className="flex"
          >
            <p className={item.className}>{item?.label}:</p>&nbsp;
            <p className={item.className}> {item?.value}</p>
          </div>
        )
      })}
    </div>
  )
}
