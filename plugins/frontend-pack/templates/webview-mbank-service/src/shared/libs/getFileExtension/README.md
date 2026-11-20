/\*\*

- **getFileExtension**
-
- A utility function that extracts the file extension from a given URL or file path.
-
- **Functionality:**
- - Accepts a string representing a URL or file path.
- - Attempts to extract the substring after the last '.' character, which typically denotes the file extension.
- - Returns the extracted extension in lowercase for consistency.
- - If the input is invalid or no extension is found, returns an empty string.
-
- **Parameters:**
- @param {string} link - The URL or file path from which to extract the file extension.
-
- **Returns:**
- @returns {string} The extracted file extension in lowercase, or an empty string if no valid extension is found.
-
- **Example:**
- ```javascript

  ```

- import { getFileExtension } from './path/to/utility';
-
- const url = 'https://example.com/path/to/file.txt';
- const extension = getFileExtension(url);
- // extension === 'txt'
-
- const path = '/home/user/document.pdf';
- const extension = getFileExtension(path);
- // extension === 'pdf'
-
- const noExtension = 'https://example.com/path/to/folder/';
- const extension = getFileExtension(noExtension);
- // extension === ''
- ```

  ```

-
- **Note:**
- - This function uses basic string manipulation methods to extract the file extension. It does not perform any validation on the URL or file path structure.
- - Ensure that the input string is a valid URL or file path. Malformed inputs may lead to unexpected results.
- - The function returns the extension in lowercase to maintain consistency, as file extensions are typically case-insensitive.
