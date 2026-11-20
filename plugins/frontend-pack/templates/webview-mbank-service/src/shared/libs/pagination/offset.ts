export const getOffset = (page: number, limit: number) => {
  if (!(page - 1)) return 0

  return (page - 1) * limit
}

interface PropsPage {
  count: number
  limit: number
}

export const getCountPage = ({ count, limit }: PropsPage) => {
  return Math.ceil(count / limit)
}
