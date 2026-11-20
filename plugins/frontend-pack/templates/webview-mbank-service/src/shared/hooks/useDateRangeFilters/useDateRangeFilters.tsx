import { DateFormats } from '@shared/libs/dayjs'
import dayjs, { Dayjs } from 'dayjs'

import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

const DefaultStartDate = dayjs().startOf('day')
const DefaultEndDate = dayjs().endOf('day')

export const useDateRangeFilters = (
  format: string = DateFormats.full_default,
  defaultStartDate: Dayjs = DefaultStartDate,
  defaultEndDate: Dayjs = DefaultEndDate,
) => {
  const { setQueryRangeFilters } = useQueryParamsFilters()
  const [searchParams] = useSearchParams()

  const formattedDefaultStartDate = defaultStartDate.format(format)
  const formattedDefaultEndDate = defaultEndDate.format(format)

  const dateRangeValue = useMemo(() => {
    const date_gte = searchParams.get('date_gte') || formattedDefaultStartDate
    const date_lte = searchParams.get('date_lte') || formattedDefaultEndDate
    return date_gte && date_lte ? `${date_gte}, ${date_lte}` : undefined
  }, [formattedDefaultEndDate, formattedDefaultStartDate, searchParams])

  const updateDateRange = (value: [Dayjs | null, Dayjs | null] | null) => {
    if (!value) {
      setQueryRangeFilters(null, null)
      return
    }
    const startDate = value[0]?.startOf('day').format(format)
    const endDate = value[1]?.endOf('day').format(format)
    setQueryRangeFilters(startDate, endDate)
  }

  return { dateRangeValue, updateDateRange }
}

export const useQueryParamsFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const setQueryRangeFilters = (
    startDate: string | null | undefined,
    endDate: string | null | undefined,
  ) => {
    const updatedParams = new URLSearchParams(searchParams)

    if (startDate) {
      updatedParams.set('date_gte', startDate)
    } else {
      updatedParams.delete('date_gte')
    }

    if (endDate) {
      updatedParams.set('date_lte', endDate)
    } else {
      updatedParams.delete('date_lte')
    }

    setSearchParams(updatedParams)
  }

  return {
    setQueryRangeFilters,
  }
}
