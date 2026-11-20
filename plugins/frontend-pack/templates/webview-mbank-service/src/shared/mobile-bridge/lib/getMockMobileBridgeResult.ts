import {
  type MobileBridgeEventType,
  type MobileBridgeJsonValue,
  type MobileBridgeResult,
} from '../types'

const defaultMockResult = {
  status: 'ok',
  mocked: true,
} satisfies Record<string, MobileBridgeJsonValue>

export const getMockMobileBridgeResult = <TType extends MobileBridgeEventType>(
  type: TType,
): MobileBridgeResult<TType> => {
  switch (type) {
    case 'biometry.isAvailable':
      return { available: false } as MobileBridgeResult<TType>
    case 'biometry.read':
      return { value: null } as MobileBridgeResult<TType>
    case 'device.report':
      return { report: null } as MobileBridgeResult<TType>
    default:
      return defaultMockResult as MobileBridgeResult<TType>
  }
}
