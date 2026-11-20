import { LoaderFunctionArgs } from 'react-router-dom'

interface CheckChangedQueryParamsProps {
  callBack: () => Promise<Response | null>
  loader: LoaderFunctionArgs<unknown>
}

let prevUrl = ''
export const checkChangedQueryParams = ({
  loader: { request },
  callBack,
}: CheckChangedQueryParamsProps) => {
  const url = new URL(request.url)

  if (url.pathname !== prevUrl) {
    prevUrl = url.pathname
    return callBack()
  }

  prevUrl = url.pathname
  return null
}
