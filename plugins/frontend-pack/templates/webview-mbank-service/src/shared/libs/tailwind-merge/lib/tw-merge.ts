/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { createTailwindMerge } from './create-tailwind-merge'
import { getDefaultConfig } from './default-config'

export const twMerge = createTailwindMerge(getDefaultConfig)
