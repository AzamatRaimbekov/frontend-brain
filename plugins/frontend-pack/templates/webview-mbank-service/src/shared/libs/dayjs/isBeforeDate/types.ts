import { ManipulateType } from 'dayjs'

export interface BeforeDateProps {
  format?: string
  date?: string
  count?: number
  type?: ManipulateType
  end_date?: string
  start_date?: string
}
