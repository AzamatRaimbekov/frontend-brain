import { useParams } from 'react-router-dom'

export const usePageParams = () => {
  return useParams() as Partial<Record<AllPageParams, string>>
}
