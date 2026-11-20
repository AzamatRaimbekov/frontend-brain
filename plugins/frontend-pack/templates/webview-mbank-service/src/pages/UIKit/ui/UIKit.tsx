import { Icon } from '@shared/iconpack'
import { useGlobalNotification } from '@shared/notification'
import { Accordion } from '@shared/ui/Accordion'
import { AppLoader } from '@shared/ui/AppLoader'
import { Button } from '@shared/ui/Button'
import { Checkbox } from '@shared/ui/Checkbox'
import { EmptyArchieve } from '@shared/ui/EmptyArchieve'
import { ErrorPage } from '@shared/ui/ErrorPage'
import { FileUploader, FileUploaderFile } from '@shared/ui/FileUploader'
import { FloatingLabel } from '@shared/ui/FloatingLabel'
import { HorizontalStepper } from '@shared/ui/HorizontalStepper'
import { InputNumber } from '@shared/ui/InputNumber'
import { ListDescription } from '@shared/ui/ListDescription'
import { NumberSlider } from '@shared/ui/NumberSlider'
import { PopupSelect } from '@shared/ui/PopupSelect'
import { PopupText } from '@shared/ui/PopupText'
import { Preloader } from '@shared/ui/Preloader'
import { Radio, RadioGroup } from '@shared/ui/Radio'
import { RangePicker } from '@shared/ui/RangePicker'
import { ResultView } from '@shared/ui/ResultView'
import { ScrollableTabs } from '@shared/ui/ScrollableTabs'
import { Segmented, SegmentedValue } from '@shared/ui/Segmented'
import { Select } from '@shared/ui/Select'
import { Switch } from '@shared/ui/Switch'
import { TextFiled } from '@shared/ui/TextFiled'
import { Textarea } from '@shared/ui/Textarea'
import { WarningInfo } from '@shared/ui/WarningInfo'

import { ReactNode, useState } from 'react'

const segmentedOptions = [
  { label: 'Активные', value: 'active' },
  { label: 'Архивные', value: 'archived' },
]

const selectOptions = [
  { label: 'Бишкек', value: 'bishkek' },
  { label: 'Ош', value: 'osh' },
]

const categoryTabs = [
  { key: 'all', label: 'Все' },
  { key: 'forms', label: 'Формы' },
  { key: 'navigation', label: 'Навигация' },
  { key: 'states', label: 'Состояния' },
]

const applicationSteps = [
  { id: 'vehicle', title: 'Авто' },
  { id: 'documents', title: 'Документы' },
  { id: 'review', title: 'Проверка' },
]

const Section = ({
  children,
  description,
  title,
}: {
  children: ReactNode
  description?: string
  title: string
}) => (
  <section className="border-border bg-card px-4 py-5">
    <div className="mb-4">
      <h2 className="text-[20px] leading-6 font-extrabold text-foreground">
        {title}
      </h2>
      {description && (
        <p className="mt-1 text-sm leading-5 text-muted-foreground">
          {description}
        </p>
      )}
    </div>
    {children}
  </section>
)

const PreviewRow = ({
  children,
  title,
}: {
  children: ReactNode
  title: string
}) => (
  <div className="rounded-[20px] bg-background p-3">
    <div className="mb-3 text-xs font-bold text-muted-foreground uppercase">
      {title}
    </div>
    {children}
  </div>
)

const UIKitPage = () => {
  const { openNotification } = useGlobalNotification()
  const [segmentedValue, setSegmentedValue] = useState<SegmentedValue>('active')
  const [segmentedLargeValue, setSegmentedLargeValue] =
    useState<SegmentedValue>('active')
  const [switchEnabled, setSwitchEnabled] = useState(true)
  const [checkboxEnabled, setCheckboxEnabled] = useState(true)
  const [radioValue, setRadioValue] = useState('initial-payment')
  const [textFieldValue, setTextFieldValue] = useState('')
  const [floatingTextValue, setFloatingTextValue] = useState('')
  const [floatingTextareaValue, setFloatingTextareaValue] = useState('')
  const [numberValue, setNumberValue] = useState<number | null>(125000)
  const [propertyCost, setPropertyCost] = useState<number | null>(20000000)
  const [creditTerm, setCreditTerm] = useState<number | null>(3)
  const [uploadedDocuments, setUploadedDocuments] = useState<
    FileUploaderFile[]
  >([])
  const [selectValue, setSelectValue] = useState<string | number | null>(
    'bishkek',
  )
  const [popupSelectValue, setPopupSelectValue] = useState<
    string | number | null
  >(null)
  const [popupTextValue, setPopupTextValue] = useState<string | number | null>(
    null,
  )
  const [sliderValue, setSliderValue] = useState(25)
  const [rangeValue, setRangeValue] = useState<[number, number]>([20, 70])
  const [stepperCurrent, setStepperCurrent] = useState(1)
  const [activeTab, setActiveTab] = useState<string | number | null>('all')

  const handleToast = (
    type: 'default' | 'success' | 'info' | 'warning' | 'error' | 'loading',
  ) => {
    openNotification({
      type,
      title: `Toast: ${type}`,
      subtitle: 'Проверка глобального notification/toast компонента.',
      duration: type === 'loading' ? 2500 : 4000,
    })
  }

  return (
    <main className="mx-auto min-h-dvh max-w-2xl bg-background pb-8">
      <header className="bg-card px-4 pt-6 pb-5">
        <div className="text-xs font-bold tracking-[0.12em] text-primary uppercase">
          UI Kit
        </div>
        <h1 className="mt-2 text-[28px] leading-[34px] font-extrabold text-foreground">
          Components playground
        </h1>
        <p className="mt-2 text-base leading-6 text-muted-foreground">
          Быстрая страница для проверки shared components, размеров, состояний и
          поведения в mobile WebView.
        </p>
      </header>

      <div className="mt-3 flex flex-col gap-3">
        <Section
          title="Button"
          description="Основные варианты, размеры и block-состояние."
        >
          <div className="flex flex-col gap-3">
            <Button block>Primary 56</Button>
            <Button
              block
              size="md"
            >
              Primary 48
            </Button>
            <Button
              block
              variant="secondary"
            >
              Secondary
            </Button>
            <Button
              block
              variant="white"
            >
              White
            </Button>
            <Button
              block
              variant="danger"
            >
              Danger
            </Button>
            <div className="flex items-center justify-between gap-3">
              <Button variant="text">Text brand</Button>
              <Button
                className="text-destructive"
                variant="text"
              >
                Text danger
              </Button>
            </div>
            <Button
              block
              disabled
            >
              Disabled
            </Button>
          </div>
        </Section>

        <Section
          title="Segmented"
          description="Shadcn/Base Tabs, визуально как mobile segmented control."
        >
          <div className="flex flex-col gap-3">
            <PreviewRow title="36px">
              <Segmented
                block
                size="sm"
                value={segmentedValue}
                options={segmentedOptions}
                onChange={setSegmentedValue}
              />
            </PreviewRow>
            <PreviewRow title="48px">
              <Segmented
                block
                value={segmentedValue}
                options={segmentedOptions}
                onChange={setSegmentedValue}
              />
            </PreviewRow>
            <PreviewRow title="56px">
              <Segmented
                block
                size="lg"
                value={segmentedLargeValue}
                options={[
                  { label: 'Физ. лицо', value: 'active' },
                  { label: 'Юр. лицо', value: 'archived' },
                ]}
                onChange={setSegmentedLargeValue}
              />
            </PreviewRow>
            <PreviewRow title="Disabled">
              <Segmented
                block
                disabled
                value="active"
                options={segmentedOptions}
              />
            </PreviewRow>
          </div>
        </Section>

        <Section
          title="Switch"
          description="Размеры и controlled-поведение."
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-base font-medium text-foreground">
                Notifications
              </span>
              <Switch
                checked={switchEnabled}
                onCheckedChange={setSwitchEnabled}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-base font-medium text-foreground">
                Small
              </span>
              <Switch
                checked
                size="sm"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-base font-medium text-foreground">
                Large disabled
              </span>
              <Switch
                checked
                disabled
                size="lg"
              />
            </div>
          </div>
        </Section>

        <Section
          title="Checkbox"
          description="Прозрачное unchecked-состояние, зелёная заливка в checked."
        >
          <div className="flex flex-col gap-4">
            <Checkbox
              checked={checkboxEnabled}
              className="text-base leading-5 font-medium text-muted-foreground"
              onCheckedChange={setCheckboxEnabled}
            >
              Я ознакомлен(а) с условиями публичной оферты
            </Checkbox>
            <Checkbox
              className="text-base leading-5 font-medium text-muted-foreground"
              size="lg"
            >
              Unchecked, размер 32px
            </Checkbox>
            <Checkbox
              checked
              className="text-base leading-5 font-medium text-muted-foreground"
              disabled
            >
              Checked disabled
            </Checkbox>
          </div>
        </Section>

        <Section
          title="Radio"
          description="Групповой выбор с текстом слева или справа от control."
        >
          <RadioGroup
            value={radioValue}
            onValueChange={setRadioValue}
          >
            <Radio
              className="w-full justify-between"
              labelPosition="left"
              value="initial-payment"
            >
              <span className="flex flex-col gap-0.5">
                <span className="text-base leading-5 font-semibold text-foreground">
                  Первоначальный взнос
                </span>
                <span className="text-sm leading-4 text-muted-foreground">
                  Взнос наличными от 30%
                </span>
              </span>
            </Radio>
            <Radio
              className="w-full justify-between"
              labelPosition="left"
              value="guarantee-fund"
            >
              <span className="flex flex-col gap-0.5">
                <span className="text-base leading-5 font-semibold text-foreground">
                  Первоначальный взнос через Гарантийный Фонд
                </span>
                <span className="text-sm leading-4 text-muted-foreground">
                  Комиссия 2% от суммы первоначального взноса Гарантийного Фонда
                </span>
              </span>
            </Radio>
            <Radio value="right-label">Текст справа от radio</Radio>
          </RadioGroup>
        </Section>

        <Section
          title="Form fields"
          description="58px по умолчанию, compact 48px, белый background и error border."
        >
          <div className="flex flex-col gap-3">
            <TextFiled
              placeholder="Текстовое поле"
              value={textFieldValue}
              onChange={(event) => setTextFieldValue(event.currentTarget.value)}
            />
            <TextFiled
              error
              placeholder="Поле с ошибкой"
              size="compact"
            />
            <InputNumber
              addSymbol="сом"
              onChange={setNumberValue}
              value={numberValue}
            />
            <Select
              allowClear
              onChange={setSelectValue}
              onClear={() => setSelectValue(null)}
              options={selectOptions}
              placeholder="Выберите город"
              value={selectValue}
            />
          </div>
        </Section>

        <Section
          title="Floating label"
          description="Работает с controlled и uncontrolled controls без Form.Item."
        >
          <div className="flex flex-col gap-3">
            <FloatingLabel label="Гос. номер">
              <TextFiled
                value={floatingTextValue}
                onChange={(event) =>
                  setFloatingTextValue(event.currentTarget.value)
                }
              />
            </FloatingLabel>
            <FloatingLabel label="Сумма">
              <InputNumber
                addSymbol="сом"
                defaultValue={121123123}
              />
            </FloatingLabel>
            <FloatingLabel label="Город">
              <Select
                options={selectOptions}
                placeholder=""
              />
            </FloatingLabel>
            <FloatingLabel label="Комментарий">
              <Textarea
                value={floatingTextareaValue}
                onChange={(event) =>
                  setFloatingTextareaValue(event.currentTarget.value)
                }
              />
            </FloatingLabel>
          </div>
        </Section>

        <Section
          title="Popup select"
          description="Select и text action с options в bottom sheet, включая empty state."
        >
          <div className="flex flex-col gap-3">
            <PopupSelect
              onChange={setPopupSelectValue}
              options={selectOptions}
              placeholder="Выберите город"
              title="Выберите город"
              value={popupSelectValue}
            />
            <PopupSelect
              options={[]}
              placeholder="Пустой PopupSelect"
              title="Выберите город"
            />
            <PopupText
              onChange={setPopupTextValue}
              options={selectOptions}
              title="Выберите город"
            >
              {popupTextValue
                ? `Выбрано: ${popupTextValue}`
                : 'Открыть PopupText'}
            </PopupText>
            <PopupText
              onChange={() => undefined}
              options={[]}
              title="Пустой список"
            >
              Пустой PopupText
            </PopupText>
          </div>
        </Section>

        <Section
          title="Number slider"
          description="Изменение значения в input и движение slider всегда используют одну сумму."
        >
          <div className="flex w-full flex-col gap-2">
            <NumberSlider
              addSymbol="сом"
              max={40000000}
              min={5000000}
              onChange={setPropertyCost}
              sliderLabel="Стоимость недвижимости"
              step={1000000}
              value={propertyCost}
              view="card"
            />
            <NumberSlider
              max={60}
              min={1}
              onChange={setCreditTerm}
              sliderLabel="Срок кредита"
              step={1}
              value={creditTerm}
              view="card"
            />
          </div>
        </Section>

        <Section
          title="File uploader"
          description="Нативный file input: после выбора файлов показывает компактную кнопку и превью."
        >
          <FileUploader
            accept="image/png,image/jpeg,application/pdf"
            description="Загрузите документы, подтверждающие наличие ваших доходов (патент, свидетельство, ...)"
            files={uploadedDocuments}
            maxFiles={3}
            onFilesSelected={(files) => {
              setUploadedDocuments((currentFiles) => [
                ...currentFiles,
                ...files.slice(0, 3 - currentFiles.length).map((file) => ({
                  id: `${file.name}-${file.lastModified}`,
                  name: file.name,
                  previewUrl: URL.createObjectURL(file),
                })),
              ])
            }}
            onRemove={(file) => {
              setUploadedDocuments((currentFiles) =>
                currentFiles.filter(
                  (currentFile) => currentFile.id !== file.id,
                ),
              )
            }}
            title="Документы о доходе"
          />
        </Section>

        <Section
          title="Accordion"
          description="Shadcn/Base Accordion, отдельные карточки с кастомным content."
        >
          <Accordion
            type="multiple"
            defaultValue={['islamic-banking']}
            items={[
              {
                value: 'islamic-banking',
                title: 'Отличия исламского банкинга от традиционного',
                content:
                  'Деньги - не предмет продажи, а средство обмена и мерило стоимости. В исламском банкинге операции основаны на торговых сделках, арендных соглашениях или долевом участии.',
              },
              {
                value: 'benefits',
                title: 'Преимущества исламского банкинга',
                content: (
                  <div className="flex flex-col gap-2">
                    <div className="font-bold text-foreground">
                      Кастомный JSX-контент
                    </div>
                    <ul className="list-disc space-y-1 pl-5">
                      <li>
                        Можно рендерить списки, кнопки, формы и любые блоки.
                      </li>
                      <li>Контент находится в отдельном secondary-блоке.</li>
                    </ul>
                    <Icon name="completed" />
                    <Button
                      size="md"
                      variant="secondary"
                    >
                      Подробнее
                    </Button>
                  </div>
                ),
              },
              {
                value: 'murabaha',
                title: 'Что такое Мурабаха?',
                content:
                  'Мурабаха - формат сделки, где банк покупает товар и продает его клиенту с заранее известной наценкой.',
              },
              {
                value: 'qard',
                title: 'Что такое Кард?',
                content:
                  'Кард - беспроцентная форма займа, которая используется в рамках исламских финансовых принципов.',
              },
            ]}
          />
        </Section>

        <Section
          title="RangePicker"
          description="Shadcn/Base Slider: один бегунок по умолчанию, диапазон - опционально."
        >
          <div className="flex flex-col gap-3">
            <div className="rounded-[20px] border border-border bg-card p-3">
              <div className="mb-3 text-xs font-bold text-muted-foreground uppercase">
                {`Single: ${sliderValue}`}
              </div>
              <RangePicker
                value={sliderValue}
                onValueChange={setSliderValue}
              />
            </div>
            <PreviewRow title={`Range: ${rangeValue[0]} - ${rangeValue[1]}`}>
              <RangePicker
                value={rangeValue}
                onValueChange={setRangeValue}
              />
            </PreviewRow>
            <PreviewRow title="Disabled">
              <RangePicker
                defaultValue={25}
                disabled
              />
            </PreviewRow>
          </div>
        </Section>

        <Section
          title="HorizontalStepper"
          description="Индикатор этапов для линейного flow с завершенными, текущим и ожидающими шагами."
        >
          <div className="flex flex-col gap-3">
            <PreviewRow title={`Current step: ${stepperCurrent + 1}`}>
              <HorizontalStepper
                current={stepperCurrent}
                items={applicationSteps}
              />
            </PreviewRow>
            <div className="grid grid-cols-3 gap-2">
              {applicationSteps.map((step, index) => (
                <Button
                  key={step.id}
                  size="md"
                  variant={stepperCurrent === index ? 'primary' : 'secondary'}
                  onClick={() => setStepperCurrent(index)}
                >
                  {index + 1}
                </Button>
              ))}
            </div>
            <PreviewRow title="Custom statuses">
              <HorizontalStepper
                items={[
                  { id: 'first', title: 'Готово', status: 'finish' },
                  { id: 'second', title: 'В работе', status: 'process' },
                  { id: 'third', title: 'Ожидание', status: 'wait' },
                ]}
              />
            </PreviewRow>
          </div>
        </Section>

        <Section
          title="Toasts"
          description="Глобальные notification/toast состояния через sonner."
        >
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="secondary"
              onClick={() => handleToast('default')}
            >
              Default
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleToast('success')}
            >
              Success
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleToast('info')}
            >
              Info
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleToast('warning')}
            >
              Warning
            </Button>
            <Button
              variant="danger"
              onClick={() => handleToast('error')}
            >
              Error
            </Button>
            <Button
              variant="white"
              onClick={() => handleToast('loading')}
            >
              Loading
            </Button>
          </div>
        </Section>

        <Section title="Status Blocks">
          <div className="flex flex-col gap-3">
            <WarningInfo
              title="Важная информация"
              description="Компонент можно использовать для предупреждений и пояснений внутри формы."
            />
            <div className="flex h-24 items-center justify-center rounded-[20px] bg-background">
              <Preloader className="h-auto" />
            </div>
          </div>
        </Section>

        <Section
          title="ResultView"
          description="Full-screen result component inside a constrained preview."
        >
          <div className="overflow-hidden rounded-[20px] border border-border bg-card">
            <ResultView
              showClose={false}
              className="min-h-[360px]"
              contentClassName="py-8"
              icon={
                <Icon
                  name="applicationAccepted"
                  size={56}
                  color="var(--color-primary)"
                />
              }
              title="Заявка отправлена"
              subtitle="Мы сообщим о результате проверки в уведомлениях."
              button={
                <Button
                  block
                  size="md"
                >
                  Хорошо
                </Button>
              }
            />
          </div>
        </Section>

        <Section
          title="Empty and Error"
          description="Архивное empty-state и full-screen error preview."
        >
          <div className="flex flex-col gap-3">
            <PreviewRow title="EmptyArchieve">
              <EmptyArchieve
                title="Архив пуст"
                subtitle="Здесь появятся завершенные заявки."
              />
            </PreviewRow>
            <PreviewRow title="ErrorPage">
              <div className="relative h-[360px] transform-gpu overflow-hidden rounded-[20px] bg-background">
                <div className="pointer-events-none">
                  <ErrorPage
                    title="Технические работы"
                    subtitle="Сервис временно недоступен. Попробуйте позже."
                  />
                </div>
              </div>
            </PreviewRow>
          </div>
        </Section>

        <Section
          title="Loaders"
          description="AppLoader и простой Preloader."
        >
          <div className="flex flex-col gap-3">
            <PreviewRow title="AppLoader">
              <div className="overflow-hidden rounded-[20px] bg-background [&>*]:!min-h-[260px]">
                <AppLoader />
              </div>
            </PreviewRow>
            <PreviewRow title="Preloader">
              <div className="flex h-32 items-center justify-center rounded-[20px] bg-card">
                <Preloader className="h-auto" />
              </div>
            </PreviewRow>
          </div>
        </Section>

        <Section
          title="ScrollableTabs and Lists"
          description="Горизонтальные tabs и описание key/value."
        >
          <div className="flex flex-col gap-4">
            <PreviewRow title="ScrollableTabs">
              <ScrollableTabs
                activeTab={activeTab}
                tabs={categoryTabs}
                onTabChange={setActiveTab}
              />
            </PreviewRow>
            <div className="rounded-[20px] bg-card px-4">
              <ListDescription
                list={[
                  {
                    title: 'Selected tab',
                    description: activeTab,
                  },
                  {
                    title: 'Mode',
                    description: segmentedValue,
                  },
                  {
                    title: 'Switch',
                    description: switchEnabled ? 'Enabled' : 'Disabled',
                  },
                ]}
              />
            </div>
          </div>
        </Section>
      </div>
    </main>
  )
}

export default UIKitPage
