/\*\*

- **displayDate**
-
- A utility function that formats a given date (string or Date object) into a human-readable string using a specified date format.
-
- **Functionality:**
- - Validates if the date is provided; returns a placeholder (`'-'`) if it is missing.
- - Converts the input date into a dayjs instance.
- - Checks if the created dayjs date is valid.
- - Formats the valid date according to the provided or default date format.
- - Logs any errors encountered during formatting using the `logger` and returns the placeholder.
-
- **Parameters:**
- @param {string | Date | undefined} date - The date to be formatted. Can be a string, a Date object, or undefined.
- @param {string} [dateFormat=DateFormats.full_primary] - The format string used to format the date. Defaults to `DateFormats.full_primary`.
-
- **Returns:**
- @returns {string} A formatted date string if the date is valid; otherwise, returns a placeholder (`'-'`).
-
- **Example:**
- ```ts

  ```

- import { displayDate } from './path/to/displayDate'
- import { DateFormats } from '../model'
-
- const formattedDate = displayDate('2023-04-15', DateFormats.full_primary)
- // Example output: "April 15, 2023" (depending on the actual format defined in DateFormats.full_primary)
- ```
  */
  ```
