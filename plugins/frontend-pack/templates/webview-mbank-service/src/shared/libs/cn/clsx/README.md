/\*\*

- **someElementInToArray**
-
- A utility function that finds the first element in one array that is also present in another array.
-
- **Functionality:**
- - Iterates over each element in the first array (`arr1`).
- - Checks if the current element exists in the second array (`arr2`).
- - Returns the first matching element if found; otherwise, returns `null`.
-
- **Parameters:**
- @param {string[]} arr1 - The array in which to search for a matching element.
- @param {string[]} arr2 - The array to check for the presence of elements from `arr1`.
-
- **Returns:**
- @returns {string | null} The first element from `arr1` that is also found in `arr2`, or `null` if no such element exists.
-
- **Example:**
- ```ts

  ```

- const array1 = ['apple', 'banana', 'cherry'];
- const array2 = ['kiwi', 'banana', 'orange'];
- const result = someElementInToArray(array1, array2);
- // result === 'banana'
- ```
  */
  ```
