/\*\*

- **displaySum**
-
- A utility function that formats a numerical value as a string representing a sum in Kyrgyz Som (KGS). If the input value is `null` or `undefined`, it returns a specified placeholder.
-
- **Functionality:**
- - Accepts a numerical value and an optional placeholder string.
- - Utilizes the `formatNumber` function to:
- - Format the number to two decimal places.
- - Append the ' KGS' suffix to denote the currency.
- - Return the specified placeholder if the input value is `null` or `undefined`.
-
- **Parameters:**
- @param {number | null | undefined} value - The numerical value to be formatted.
- @param {string} [placeholder='-'] - The placeholder to return if the input value is `null` or `undefined`. Defaults to `'-'`.
-
- **Returns:**
- @returns {string} The formatted sum as a string with two decimal places and ' KGS' suffix, or the placeholder if the input is invalid.
-
- **Example:**
- ```ts

  ```

- import { displaySum } from './path/to/displaySum';
-
- const amount = 1234.5;
- const formattedAmount = displaySum(amount);
- // formattedAmount === '1,234.50 KGS'
-
- const noAmount = null;
- const formattedNoAmount = displaySum(noAmount, 'N/A');
- // formattedNoAmount === 'N/A'
- ```

  ```

-
- **Note:**
- - Ensure that the `formatNumber` function is properly imported from the '../formatNumber' module. This function is expected to handle the actual number formatting based on the provided options.
- - The default placeholder is `'-'`, but it can be customized by providing a different string as the second argument.
    \*/
