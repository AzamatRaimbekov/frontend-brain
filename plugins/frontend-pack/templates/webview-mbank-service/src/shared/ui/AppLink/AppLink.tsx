import { Link, type LinkProps } from 'react-router-dom'

type AppLinkProps = LinkProps

export function AppLink({ children, to, ...props }: AppLinkProps) {
  const updatedTo =
    typeof to === 'string' ? `${to}${window.location.search}` : to

  return (
    <Link
      to={updatedTo}
      {...props}
    >
      {children}
    </Link>
  )
}
