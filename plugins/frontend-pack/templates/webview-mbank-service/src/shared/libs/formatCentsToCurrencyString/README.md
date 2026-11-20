/\*\*

- **formatTyinsToSoms**
-
- A utility function that converts an amount in tyiyns to soms and returns it as a formatted string with two decimal places and space-separated thousands.
-
- **Functionality:**
- - Checks if the input `tyins` is `null` or `undefined`; if so, returns a placeholder (`'-'`).
- - Converts tyiyns to soms by dividing the input by 100, since one som equals 100 tyiyns.
- - Formats the resulting soms to two decimal places.
- - Inserts spaces as thousand separators for better readability.
- - Appends the currency label 'сом' to indicate Kyrgyzstani som.
-
- **Parameters:**
- @param {number | null | undefined} tyins - The amount in tyiyns to be converted and formatted.
-
- **Returns:**
- @returns {string} The formatted amount in soms with two decimal places, space-separated thousands, and the 'сом' label. Returns `'-'` if the input is `null` or `undefined`.
-
- **Example:**
- ```javascript

  ```

- import { formatTyinsToSoms } from './path/to/utility';
-
- const amountInTyins = 123456789;
- const formattedAmount = formatTyinsToSoms(amountInTyins);
- // formattedAmount === '1 234 567.89 сом'
- ```

  ```

-
- **Note:**
- - This function uses JavaScript's `toLocaleString` method to format numbers with space-separated thousands, adhering to the 'ru-RU' locale conventions. :contentReference[oaicite:1]{index=1}
    \*/
    export function formatTyinsToSoms(tyins: number | null | undefined): string {
    if (tyins === null || tyins === undefined) {
    return '-';
    }
    const soms = tyins / 100;
    const formattedSoms = soms
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return `${formattedSoms} сом`;
    }
