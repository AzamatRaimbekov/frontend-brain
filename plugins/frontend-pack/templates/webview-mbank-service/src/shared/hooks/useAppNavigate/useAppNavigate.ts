import { type NavigateOptions, useNavigate } from 'react-router-dom'

export const useAppNavigate = () => {
  const navigation = useNavigate()

  const navigate = (to: string | number, options?: NavigateOptions) => {
    if (typeof to === 'number') {
      navigation(to)
      return
    }

    navigation(to, options)
  }

  return navigate
}
