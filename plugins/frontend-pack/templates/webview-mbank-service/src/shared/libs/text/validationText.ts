export const requiredText = 'Обязательное поле!'

export const requiredMinValue = (value: number) =>
  `Минимальное количество символов - ${value}`

export const minNumber = (value: number) => `Минимальное значение - ${value}`

export const requiredPhoneText = 'Введите номер телефона'
export const invalidPhoneText = 'Введите номер в формате +996XXXXXXXXX'
export const inalidRealPhoneText = 'Введите корректный номер телефона'
export const invalidInn = 'Введите корректный ИНН (14 цифр)'
export const requiredFileText = 'Загрузите файл'

export const invalidFileFormat = 'Неверный формат файла'
export const tryDifferentFile = 'Попробуйте загрузить другой файл'
export const invalidFileSize = (size: number) =>
  `Максимальный размер файла - ${size} МБ`

export const requiredMinDownPayment = `Взнос должен быть минимально 30% от стоимости недвижимости`
