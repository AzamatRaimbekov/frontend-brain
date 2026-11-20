/\*\*

- **formatNumber**
-
- A utility function that formats a number according to specified options, including prefix, suffix, fixed decimal places, and placeholder for invalid inputs.
-
- **Functionality:**
- - Accepts a number and an options object to customize the formatting.
- - If the input is a valid number:
- - Rounds the number to the specified decimal places (`toFixed`).
- - Formats the integer part with space-separated thousands for better readability.
- - Appends the specified prefix and suffix to the formatted number.
- - If the input is `null` or `undefined`, returns the specified placeholder with the prefix and suffix.
-
- **Parameters:**
- @param {number | null | undefined} number - The number to be formatted.
- @param {Object} [options] - An optional object to specify formatting options.
- @param {string} [options.prefix=''] - A string to prepend to the formatted number. Defaults to an empty string.
- @param {string} [options.suffix=''] - A string to append to the formatted number. Defaults to an empty string.
- @param {number} [options.toFixed] - The number of decimal places to round the number to. If not specified, the number is not rounded.
- @param {string} [options.placeholder='0.00'] - The placeholder to return if the input is `null` or `undefined`. Defaults to `'0.00'`.
-
- **Returns:**
- @returns {string} The formatted number as a string, including the specified prefix and suffix. If the input is invalid, returns the placeholder with prefix and suffix.
-
- **Example:**
- ```javascript

  ```

- import { formatNumber } from './path/to/formatNumber';
-
- const formatted = formatNumber(1234567.89, {
- prefix: '$',
- suffix: ' USD',
- toFixed: 2,
- placeholder: 'N/A',
- });
- // formatted === '$1 234 567.89 USD'
- ```

  ```

-
- **Note:**
- - This function uses the `Intl.NumberFormat` object to format numbers according to the 'ru-RU' locale, which uses a space as the thousand separator. :contentReference[oaicite:0]{index=0}
- - Ensure that the environment supports the `Intl` object; it's widely supported in modern browsers and Node.js.
