/\*\*

- **downloadFile**
-
- A utility function to download a file from a specified URL with optional query parameters and authentication.
-
- **Functionality:**
- - Constructs the download URL with optional query parameters.
- - Optionally includes an Authorization header with a bearer token retrieved from `TokenStorage`.
- - Initiates a fetch request to download the file as a blob.
- - Creates a temporary anchor (`<a>`) element to trigger the file download in the browser.
- - Handles errors gracefully and logs them using the `logger`.
-
- **Parameters:**
- @param {object} options - Configuration options for the download.
- @param {string} options.baseUrl - The base URL of the file to be downloaded.
- @param {string} [options.fileName='report'] - The desired name for the downloaded file. Defaults to `'report'`.
- @param {Record<string, any>} [options.params] - An object representing query parameters to be appended to the URL.
- @param {boolean} [options.withoutAuth=false] - A flag indicating whether to omit the Authorization header. Defaults to `false`.
-
- **Returns:**
- @returns {Promise<void>} A promise that resolves when the download is initiated.
-
- **Example:**
- ```javascript

  ```

- import { downloadFile } from './path/to/downloadFile';
-
- downloadFile({
- baseUrl: 'https://example.com/download',
- fileName: 'example.pdf',
- params: { id: 12345 },
- withoutAuth: false,
- });
- ```

  ```

-
- **Note:**
- - The function uses the Fetch API to perform the download. Ensure that the environment supports Fetch API or include a polyfill if necessary.
- - The `TokenStorage.getFromStorage()` function should return a valid authentication token if `withoutAuth` is `false`.
- - The function creates a temporary anchor element to facilitate the download and removes it from the DOM after the download is initiated.
- - Error messages are logged using the `logger` utility. Ensure that `logger` is properly configured to capture and display errors.
    \*/
