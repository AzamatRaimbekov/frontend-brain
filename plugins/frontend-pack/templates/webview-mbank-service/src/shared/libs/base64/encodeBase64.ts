/**
 * Encodes a string to base64.
 *
 * @param input - The string to encode.
 * @returns The base64 encoded string.
 *
 * @example
 * const encoded = encodeBase64('Hello, World!');
 * console.log(encoded); // Output: 'SGVsbG8sIFdvcmxkIQ=='
 */
export function encodeBase64(input: string): string {
  return btoa(input)
}
