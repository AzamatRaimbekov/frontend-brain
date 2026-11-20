/\*\*

- **get**
-
- A utility function that safely retrieves a value from a nested object using a specified path, with an optional default value if the path is undefined.
-
- **Functionality:**
- - Accepts an object, a path (as a string or array of strings), and an optional default value.
- - Splits the path string into an array if it's not already an array.
- - Iterates through the path array to access nested properties.
- - Returns the value if found; otherwise, returns the default value.
-
- **Type Parameters:**
- @template T - The expected type of the value to be retrieved.
-
- **Parameters:**
- @param {Record<string, any> | undefined} obj - The object from which to retrieve the value. Can be undefined.
- @param {string | string[]} path - The path to the desired property, as a dot-separated string or an array of strings.
- @param {T} [defaultValue] - The value to return if the path is not found or the object is undefined.
-
- **Returns:**
- @returns {T} The value at the specified path, or the default value if the path is not found.
-
- **Example:**
- ```typescript

  ```

- import { get } from './path/to/utility';
-
- const user = {
- name: 'Alice',
- address: {
-     city: 'Wonderland',
-     zip: '12345'
- }
- };
-
- const city = get(user, 'address.city', 'Unknown');
- // city === 'Wonderland'
-
- const country = get(user, ['address', 'country'], 'Unknown');
- // country === 'Unknown'
- ```

  ```

-
- **Note:**
- - This function is useful for accessing deeply nested properties without risking runtime errors if a property in the chain is undefined.
- - If the provided path does not exist in the object, the function returns the specified default value, or `undefined` if no default is provided.
