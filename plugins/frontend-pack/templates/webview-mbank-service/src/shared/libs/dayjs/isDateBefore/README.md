/\*\*

- **isDateBefore**
-
- A utility function that checks whether a given date is before another date using dayjs.
-
- **Functionality:**
- - Accepts two Date objects (`currentDate` and `targetDate`) along with an optional unit option.
- - Converts both dates to dayjs instances.
- - Uses dayjs's `isBefore` method to determine if `currentDate` is before `targetDate` based on the specified unit of time.
- - Returns a boolean value indicating the result of the comparison.
-
- **Parameters:**
- @param {Date} currentDate - The date to be compared.
- @param {Date} targetDate - The date to compare against.
- @param {dayjs.OpUnitType} [options] - Optional unit of measurement for the comparison (e.g., 'day', 'month', 'year').
-
- **Returns:**
- @returns {boolean} `true` if `currentDate` is before `targetDate` in the specified unit; otherwise, `false`.
-
- **Example:**
- ```ts

  ```

- const date1 = new Date('2023-01-01');
- const date2 = new Date('2023-12-31');
- const result = isDateBefore(date1, date2, 'day');
- // result === true
- ```
  */
  ```
