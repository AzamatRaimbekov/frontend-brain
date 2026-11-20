/* eslint-disable jsx-a11y/iframe-has-title */
import { IframeHTMLAttributes } from 'react'

type IframeProps = IframeHTMLAttributes<HTMLIFrameElement>
export default function Iframe({ ...props }: IframeProps) {
  return <iframe {...props} />
}
