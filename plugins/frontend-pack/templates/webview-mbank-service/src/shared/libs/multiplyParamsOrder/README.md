/\*\*

- **multiplyParamsOrder**
-
- A utility function that manages the sorting order of query parameters for data retrieval. It toggles the presence and order (ascending/descending) of a specified sorting field within a comma-separated list of sorting parameters.
-
- **Functionality:**
- - Accepts a comma-separated string of current sorting parameters and a specific field to toggle.
- - Parses the string into an array of individual sorting parameters.
- - Checks if the specified field is already present in the array:
- - If present:
-     - If the field is in ascending order (e.g., `'field'`), it changes it to descending order (e.g., `'-field'`).
-     - If the field is in descending order (e.g., `'-field'`), it removes the field from the array.
- - If not present:
-     - Adds the field in ascending order to the array.
- - Returns the updated array of sorting parameters.
-
- **Parameters:**
- @param {string} params - A comma-separated string representing the current sorting parameters.
- @param {string} field - The specific field to toggle within the sorting parameters.
-
- **Returns:**
- @returns {string[]} An array of updated sorting parameters.
-
- **Example Usage:**
- ```javascript

  ```

- import { multiplyParamsOrder } from './path/to/utility';
-
- // Initial sorting parameters
- let sortingParams = 'name,-date';
-
- // Toggle the 'date' field
- sortingParams = multiplyParamsOrder(sortingParams, 'date');
- // sortingParams === ['name']
-
- // Toggle the 'date' field again
- sortingParams = multiplyParamsOrder(sortingParams, 'date');
- // sortingParams === ['name', 'date']
-
- // Toggle the 'name' field
- sortingParams = toggleSortOrder(sortingParams, 'name');
- // sortingParams === ['date']
- ```

  ```

-
- **Note:**
- - This function is particularly useful in scenarios where users can interactively sort data by different fields, such as in tables or lists with sortable columns.
- - The function assumes that the input `params` string is properly formatted as a comma-separated list of field names, with optional `'-'` prefixes indicating descending order.
- - The returned value is an array of sorting parameters, which can be joined back into a string if needed.
