import { SVGProps } from '../model/types'

const Navigation = ({ size, color, ...props }: SVGProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      {...props}
    >
      <path
        d="M5.20976 9.39607L1.50729 8.16191C-0.502428 7.49201 -0.502429 4.64932 1.50729 3.97942L13.0947 0.116933C14.818 -0.457495 16.4575 1.18198 15.8831 2.90526L12.0206 14.4927C11.3507 16.5024 8.50799 16.5024 7.83809 14.4927L6.60393 10.7902C6.38452 10.132 5.868 9.61548 5.20976 9.39607Z"
        fill={color}
      />
    </svg>
  )
}

export default Navigation
