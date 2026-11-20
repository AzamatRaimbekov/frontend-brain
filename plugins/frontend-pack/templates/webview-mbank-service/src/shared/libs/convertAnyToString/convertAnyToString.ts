export const convertAnyToString = (file: File | string | unknown) => {
  if (file instanceof File) {
    return URL.createObjectURL(file)
  }
  return file
}
