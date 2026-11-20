/\*\*

- **analyticsDaysDifferenceUnit**
-
- A utility function that determines the most appropriate unit of time ('hours', 'days', or 'months') to represent the difference between two dates for analytics purposes.
-
- **Functionality:**
- - Accepts two dates (`startDate` and `endDate`).
- - Converts the provided dates into Day.js instances.
- - Validates the dates to ensure they are valid Day.js objects.
- - If the dates are on the same day, returns `'hours'`.
- - Adjusts the `endDate` by adding one day to include the entire end date in the calculation.
- - If the adjusted `endDate` is in the future, sets `endDate` to the current date.
- - If the difference between the dates is less than one month, returns `'days'`.
- - For differences of one month or more, returns `'months'`.
-
- **Parameters:**
- @param {string | Date | undefined} startDate - The start date of the range.
- @param {string | Date | undefined} endDate - The end date of the range.
-
- **Returns:**
- @returns {'hours' | 'days' | 'months' | undefined} The unit of time that best represents the difference between the two dates. Returns `undefined` if the dates are invalid or not provided.
-
- **Example:**
- ```ts

  ```

- import { analyticsDaysDifferenceUnit } from './path/to/analyticsDaysDifferenceUnit';
-
- const start = '2023-04-15';
- const end = '2023-04-20';
- const unit = analyticsDaysDifferenceUnit(start, end);
- // unit === 'days'
- ```

  ```

-
- **Note:**
- Ensure that the `dayjs` library is properly imported and available in your project. This function relies on Day.js for date manipulation and validation.
  \*/
