/\*\*

- **displayDateRange**
-
- A utility function that formats and displays a date range, handling cases where the start and end dates are the same or different.
-
- **Functionality:**
- - Accepts two dates (`startDate` and `endDate`), an optional format string, and an optional unit of time for comparison.
- - Converts the provided dates into Day.js instances.
- - Validates the dates to ensure they are valid Day.js objects.
- - Checks if the two dates are the same based on the specified unit (default is 'day').
- - If the dates are the same, returns the formatted start date.
- - If the dates are different, returns a string combining both formatted dates, separated by a hyphen.
- - Logs any errors encountered during processing and returns a placeholder (`'-'`) in case of an error.
-
- **Parameters:**
- @param {string | Date | undefined | null} startDate - The start date of the range.
- @param {string | Date | undefined | null} endDate - The end date of the range.
- @param {string} [format=DateFormats.full_view_default] - The format string used to format the dates. Defaults to `DateFormats.full_view_default`.
- @param {dayjs.UnitType} [isSameUnit='day'] - The unit of time to determine if the start and end dates are the same. Defaults to 'day'.
-
- **Returns:**
- @returns {string} A formatted date string representing the date range. Returns a placeholder (`'-'`) if the dates are invalid or an error occurs.
-
- **Example:**
- ```ts

  ```

- import { displayDateRange } from './path/to/displayDateRange';
- import { DateFormats } from '../model';
-
- const start = '2023-04-15';
- const end = '2023-04-20';
- const formattedRange = displayDateRange(start, end, DateFormats.full_view_default);
- // Example output: "April 15, 2023 - April 20, 2023"
- ```

  ```

-
- **Note:**
- Ensure that the `displayDate` function and `DateFormats` are properly imported from their respective modules. The function relies on Day.js for date manipulation and formatting.
  \*/
