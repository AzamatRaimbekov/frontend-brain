/\*\*

- **displayKgzPhone**
-
- A utility function that formats Kyrgyzstan phone numbers into a standardized international format. If the input is invalid or doesn't match expected patterns, it returns the original input or a specified placeholder.
-
- **Functionality:**
- - Accepts a phone number as a string, which may include non-digit characters.
- - Removes all non-digit characters to isolate the numeric digits.
- - Checks if the resulting number matches the expected length and pattern for Kyrgyzstan phone numbers:
- - If the number has 9 digits, it assumes the format is without the country code and prefixes it with '+996'.
- - If the number starts with '996' and has 12 digits, it formats it as a full international number.
- - Returns the formatted phone number in the pattern: `+996 XXX XXX XXX`.
- - If the input doesn't match these patterns, it returns the original input or a specified placeholder.
-
- **Parameters:**
- @param {string | null | undefined} phone - The phone number to be formatted. Can be a string, null, or undefined.
- @param {string} [placeholder='-'] - The placeholder to return if the input is null, undefined, or doesn't match expected patterns. Defaults to `'-'`.
-
- **Returns:**
- @returns {string} The formatted phone number or the original input/placeholder if formatting is not applicable.
-
- **Example:**
- ```ts

  ```

- import { displayKgzPhone } from './path/to/displayKgzPhone';
-
- const phoneNumber1 = '700123456';
- const formatted1 = displayKgzPhone(phoneNumber1);
- // formatted1 === '+996 700 123 456'
-
- const phoneNumber2 = '+996700123456';
- const formatted2 = displayKgzPhone(phoneNumber2);
- // formatted2 === '+996 700 123 456'
-
- const phoneNumber3 = '12345';
- const formatted3 = displayKgzPhone(phoneNumber3, 'Invalid number');
- // formatted3 === 'Invalid number'
- ```

  ```

-
- **Note:**
- - This function assumes that valid Kyrgyzstan phone numbers are either 9 digits long (without the country code) or 12 digits long starting with '996' (with the country code).
- - The function formats numbers according to the E.123 international notation standard, using spaces to separate country code, area/operator code, and subscriber number. :contentReference[oaicite:0]{index=0}
- - Ensure that the input phone number is a string containing digits and optional formatting characters (e.g., spaces, dashes). Non-digit characters are removed during processing.
    \*/
