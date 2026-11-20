import { useGlobalModal } from '@shared/global-modal'
import { useGlobalNotification } from '@shared/notification'
import { Segmented } from '@shared/ui/Segmented'
import { Switch } from '@shared/ui/Switch'

const HomePage = () => {
  const { openModal } = useGlobalModal()
  const pnah = () => {
    openModal({
      body: <div className="w-20 bg-card p-5">as;ldkal;f</div>,
      placement: 'bottom',
      contentClassName: 'w-full max-w-20',
    })
  }
  const { openNotification } = useGlobalNotification()
  return (
    <div className="relative mx-auto min-h-dvh max-w-2xl bg-background">
      <button onClick={pnah}>Onclikc</button>
      <button
        onClick={() =>
          openNotification({
            type: 'success',
            title: 'Готово',
            subtitle: 'Заявка успешно отправлена',
          })
        }
      >
        Notif
      </button>
      <Switch />
      <Segmented
        block
        value={'SegmentedValue2'}
        options={[
          { label: 'ReactNode,', value: 'SegmentedValue' },
          { label: 'ReactNode,22', value: 'SegmentedValue2' },
        ]}
      />
      БЫ
    </div>
  )
}

export default HomePage
// accordion, badge, calendar, checkbox, radio,  11111 float label, fileuploader,
