/\*\*

- **displayFullName**
-
- A utility function that constructs a full name string from an object containing name fields, with support for empty or missing values.
-
- **Functionality:**
- - Accepts a user object that may have `first_name`, `middle_name`, and `last_name` properties.
- - Collects the available name parts in the order: last name, first name, middle name.
- - Filters out any empty or undefined values.
- - Joins the remaining name parts with a space separator to form the full name.
- - If no valid name parts are present, returns a specified placeholder.
-
- **Type Parameters:**
- @template T - A type extending `NameFields`, representing an object with optional `first_name`, `middle_name`, and `last_name` properties.
-
- **Parameters:**
- @param {CouldBeEmpty<T>} user - The user object containing name fields, which may be empty or undefined.
- @param {string} [placeholder='-'] - The placeholder string to return if no valid name parts are found. Defaults to `'-'`.
-
- **Returns:**
- @returns {string} The constructed full name or the placeholder if no valid name parts are present.
-
- **Example:**
- ```ts

  ```

- import { displayFullName } from './path/to/displayFullName';
-
- const user = {
- first_name: 'John',
- middle_name: 'H.',
- last_name: 'Doe'
- };
-
- const fullName = displayFullName(user);
- // fullName === 'Doe John H.'
- ```

  ```

-
- **Note:**
- - Ensure that the `NameFields` type and `CouldBeEmpty` utility type are properly imported from their respective modules.
- - This function is useful for displaying user names in a consistent format, even when some name components may be missing or empty.
    \*/
