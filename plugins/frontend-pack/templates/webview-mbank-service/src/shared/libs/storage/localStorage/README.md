/\*\*

- **Local Storage Utilities**
-
- A set of utility functions to interact with the browser's `localStorage`, providing methods to set, get, and delete data, including support for JSON objects.
-
- **Functions:**
-
- - `setLocalStorage`: Stores a key-value pair in `localStorage`.
- - `getLocalStorage`: Retrieves the value associated with a key from `localStorage`.
- - `getLocalStorageAsOBJ`: Retrieves the value associated with a key from `localStorage` and parses it as a JSON object.
- - `deleteLocalStorage`: Removes a key and its associated value from `localStorage`.
-
- **Usage Example:**
- ```javascript

  ```

- // Setting a string value
- setLocalStorage({ key: 'username', value: 'john_doe' });
-
- // Getting a string value
- const username = getLocalStorage('username');
- console.log(username); // Output: 'john_doe'
-
- // Setting an object
- const user = { name: 'John Doe', age: 30 };
- setLocalStorage({ key: 'user', value: JSON.stringify(user) });
-
- // Getting an object
- const userObj = getLocalStorageAsOBJ('user');
- console.log(userObj.name); // Output: 'John Doe'
-
- // Deleting a key
- deleteLocalStorage('username');
- ```

  ```

-
- **Note:**
- - When storing objects or arrays, ensure they are serialized to a JSON string using `JSON.stringify()` before storing, and parsed back into an object using `JSON.parse()` when retrieving. :contentReference[oaicite:0]{index=0}
- - Be cautious with the storage size limitations of `localStorage` (typically around 5MB) and avoid storing sensitive information, as data stored in `localStorage` is accessible through JavaScript and can be exploited via XSS attacks. :contentReference[oaicite:1]{index=1}
    \*/

/\*\*

- Stores a key-value pair in localStorage.
-
- @param {Object} params - The parameters object.
- @param {string} params.key - The key under which the value will be stored.
- @param {string} params.value - The value to be stored.
  \*/
  export const setLocalStorage = ({
  key,
  value,
  }: {
  key: string;
  value: string;
  }): void => {
  localStorage.setItem(key, value);
  };

/\*\*

- Retrieves the value associated with a key from localStorage.
-
- @param {string} key - The key whose value is to be retrieved.
- @returns {string | null} The value associated with the key, or null if the key does not exist.
  \*/
  export const getLocalStorage = (key: string): string | null => {
  return localStorage.getItem(key);
  };

/\*\*

- Retrieves the value associated with a key from localStorage and parses it as a JSON object.
-
- @param {string} key - The key whose value is to be retrieved and parsed.
- @returns {any} The parsed JSON object, or null if parsing fails or the key does not exist.
  \*/
  export const getLocalStorageAsOBJ = (key: string): any => {
  const item = localStorage.getItem(key);
  try {
  return item ? JSON.parse(item) : null;
  } catch (error) {
  console.error('Error parsing JSON from localStorage:', error);
  return null;
  }
  };

/\*\*

- Removes a key and its associated value from localStorage.
-
- @param {string} key - The key to be removed.
  \*/
  export const deleteLocalStorage = (key: string): void => {
  localStorage.removeItem(key);
  };
