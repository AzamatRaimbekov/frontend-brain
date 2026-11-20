/\*\*

- **decodeURIValue**
-
- A utility function that decodes a URI-encoded string and extracts the last segment after the final '/' character.
-
- **Functionality:**
- - Accepts a URI-encoded string as input.
- - Attempts to decode the input using JavaScript's `decodeURI()` function.
- - Splits the decoded string by '/' and returns the last segment.
- - If decoding fails (e.g., due to a malformed URI sequence), it catches the error and returns an empty string.
-
- **Parameters:**
- @param {string} file - The URI-encoded string to be decoded and processed.
-
- **Returns:**
- @returns {string} The last segment of the decoded URI string, or an empty string if decoding fails or the input is empty.
-
- **Example:**
- ```ts

  ```

- import { decodeURIValue } from './path/to/decodeURIValue';
-
- const encodedURI = 'https%3A%2F%2Fexample.com%2Fpath%2Fto%2Ffile.txt';
- const result = decodeURIValue(encodedURI);
- // result === 'file.txt'
- ```

  ```

-
- **Note:**
- - The `decodeURI()` function is used to decode complete URIs that have been encoded using `encodeURI()`. It does not decode characters that are part of the URI syntax (e.g., `:`, `/`, `?`, `#`). :contentReference[oaicite:0]{index=0}
- - If the input string is not a valid encoded URI, `decodeURI()` will throw a `URIError`. This function handles such errors by returning an empty string.
    \*/
