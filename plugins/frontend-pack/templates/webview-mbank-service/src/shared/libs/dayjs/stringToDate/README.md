/\*\*

- **stringToDate**
-
- A utility function that converts a date string into a dayjs date instance using a specified format.
-
- **Functionality:**
- - Retrieves the appropriate format string from the `DateFormats` object using the provided `dateFormat` key.
- - Checks if the input date string is provided; returns an empty string if not.
- - Attempts to parse the date string into a dayjs instance using the determined format.
- - Logs any errors encountered during parsing using the `logger` and returns an empty string on failure.
-
- **Parameters:**
- @param {string} date - The date string to be converted.
- @param {DateFormatsTypes} [dateFormat='full_default'] - The key representing the desired date format from `DateFormats`. Defaults to 'full_default'.
-
- **Returns:**
- @returns {dayjs.Dayjs | string} A dayjs instance representing the parsed date if successful, or an empty string if the input is invalid or parsing fails.
-
- **Example:**
- ```ts

  ```

- import { stringToDate } from './path/to/stringToDate'
-
- const dateInstance = stringToDate("2023-04-15", 'full_default')
- // If "2023-04-15" matches the expected format, dateInstance will be a valid dayjs instance.
- // Otherwise, dateInstance will be an empty string.
- ```
  */
  ```
