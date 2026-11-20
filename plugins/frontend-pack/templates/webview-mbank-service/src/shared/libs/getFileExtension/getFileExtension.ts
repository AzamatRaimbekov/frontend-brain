export const getFileExtension = (file: File) => {
  const ext = file.name.split('.').at(-1)
  return ext ? `.${ext.toLowerCase()}` : ''
}
