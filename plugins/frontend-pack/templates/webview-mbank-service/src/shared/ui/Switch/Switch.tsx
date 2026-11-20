import {
  Switch as BaseSwitch,
  SwitchProps as BaseSwitchProps,
} from '@shared/ui/base/switch'

export type SwitchProps = BaseSwitchProps

export function Switch(props: SwitchProps) {
  return <BaseSwitch {...props} />
}
