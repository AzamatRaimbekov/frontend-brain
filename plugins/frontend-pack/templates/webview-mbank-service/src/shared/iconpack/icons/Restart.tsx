import { SVGProps } from '../model/types'

const Restart = ({ size, color, ...props }: SVGProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 18 19"
      fill="none"
      {...props}
    >
      <path
        d="M15.364 5.05026L14.6569 4.34315C11.5327 1.21896 6.46734 1.21896 3.34315 4.34315C0.218951 7.46735 0.218951 12.5327 3.34315 15.6569C6.46734 18.7811 11.5327 18.7811 14.6569 15.6569C16.4737 13.84 17.234 11.3668 16.9377 9.00052M15.364 5.05026H11.1213M15.364 5.05026V0.807617"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default Restart
