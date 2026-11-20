/\*\*

- **useDateRangeFilters Hook**
-
- A custom React hook that manages date range filters using Day.js for date manipulation and React Router's `useSearchParams` for synchronizing URL query parameters. This hook facilitates the retrieval and updating of date range filters, ensuring that the application's state reflects the URL parameters and vice versa.
-
- **Functionality:**
- - **Default Date Range:** Initializes with a default start and end date, both set to the current day. These defaults can be customized by providing alternative Day.js objects.
- - **Formatting:** Utilizes a specified date format (defaulting to `DateFormats.full_default`) to ensure consistent date representation across the application.
- - **URL Synchronization:** Reads `date_gte` (start date) and `date_lte` (end date) from the URL's search parameters. If these parameters are absent, it falls back to the default dates.
- - **Date Range Update:** Provides a function to update the date range, which:
- - Accepts a tuple containing the new start and end dates.
- - Updates the URL search parameters accordingly.
- - If the provided value is `null`, it resets the date filters.
-
- **Parameters:**
- - `format` (string, optional): The date format string used for parsing and displaying dates. Defaults to `DateFormats.full_default`.
- - `defaultStartDate` (Day.js object, optional): The default start date. Defaults to the start of the current day.
- - `defaultEndDate` (Day.js object, optional): The default end date. Defaults to the end of the current day.
-
- **Returns:**
- - `dateRangeValue` (string | undefined): A string representing the current date range in the format `"startDate, endDate"`. If no dates are set, it returns `undefined`.
- - `updateDateRange` (function): A function to update the date range. It accepts a tuple of two Day.js objects or `null`. When invoked, it updates the URL search parameters with the new date range or resets them if `null` is passed.
-
- **Usage Example:**
- ```javascript

  ```

- import { useDateRangeFilters } from './path/to/hooks';
- import dayjs from 'dayjs';
-
- function DateRangePicker() {
- const { dateRangeValue, updateDateRange } = useDateRangeFilters();
-
- const handleDateChange = (dates) => {
-     updateDateRange(dates);
- };
-
- return (
-     <div>
-       <p>Selected Date Range: {dateRangeValue}</p>
-       <DatePicker.RangePicker
-         onChange={handleDateChange}
-         defaultValue={[dayjs().startOf('day'), dayjs().endOf('day')]}
-       />
-     </div>
- );
- }
- ```

  ```

-
- In this example:
- - The `useDateRangeFilters` hook manages the date range state and synchronizes it with the URL's search parameters.
- - The `DatePicker.RangePicker` component allows users to select a date range, and upon selection, the `handleDateChange` function updates the state and URL parameters accordingly.
-
- **Dependencies:**
- - `dayjs`: A lightweight JavaScript date library for parsing, validating, manipulating, and formatting dates.
- - `react-router-dom`: Specifically, the `useSearchParams` hook for reading and modifying the URL's query parameters.
