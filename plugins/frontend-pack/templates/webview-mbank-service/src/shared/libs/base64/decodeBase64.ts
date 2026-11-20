/**
 * Decodes a base64 string to a regular string.
 *
 * @param input - The base64 string to decode.
 * @returns The decoded string.
 *
 * @example
 * const decoded = decodeBase64('SGVsbG8sIFdvcmxkIQ==');
 * console.log(decoded); // Output: 'Hello, World!'
 */
export function decodeBase64(input: string): string {
  return atob(input)
}
