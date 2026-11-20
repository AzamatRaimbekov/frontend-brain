import { SVGProps } from '../model/types'

const Chevron = ({ size, color, ...props }: SVGProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 6 12"
      fill="none"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0.281506 11.3357C-0.0419401 11.0769 -0.0943812 10.605 0.164376 10.2815L3.78956 5.75003L0.164376 1.21855C-0.0943816 0.895107 -0.0419406 0.423138 0.281506 0.164381C0.604952 -0.0943766 1.07692 -0.041935 1.33568 0.281511L5.33568 5.28151C5.55481 5.55543 5.55481 5.94464 5.33568 6.21855L1.33568 11.2186C1.07692 11.542 0.604953 11.5944 0.281506 11.3357Z"
        fill={color}
      />
    </svg>
  )
}

export default Chevron
