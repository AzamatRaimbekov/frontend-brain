/\*\*

- **todayDate**
-
- A utility function that returns today's date as a formatted string using dayjs.
-
- **Functionality:**
- - Retrieves the current date and time using dayjs.
- - Formats the current date based on the provided or default format.
-
- **Parameters:**
- @param {string} [format=DateFormats.short_default] - The format string used to format the current date. Defaults to `DateFormats.short_default`.
-
- **Returns:**
- @returns {string} The current date formatted as a string.
-
- **Example:**
- ```ts

  ```

- import { todayDate } from './path/to/todayDate'
- import { DateFormats } from '../model'
-
- const formattedToday = todayDate(DateFormats.full_default)
- // Example output: "April 15, 2023" (depending on the format specified)
- ```
  */
  ```
