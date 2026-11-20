/\*\*

- **cn**
-
- A utility function that combines class name inputs into a merged string of Tailwind CSS classes.
-
- **Functionality:**
- - Accepts various class name inputs (strings, numbers, booleans, arrays, objects).
- - Uses `clsx` to conditionally join these inputs into a space-separated string.
- - Passes the joined string to `twMerge` to merge and optimize Tailwind CSS classes, resolving any conflicts.
-
- **Parameters:**
- @param {...ClassValue[]} inputs - An array of class name values. Each value can be a string, number, boolean, array, or object.
-
- **Returns:**
- @returns {string} A merged and optimized string of Tailwind CSS classes.
-
- **Example:**
- ```ts

  ```

- const buttonClasses = cn(
- 'bg-blue-500 hover:bg-blue-700',
- { 'text-white': true, 'text-gray-500': false },
- ['p-2', 'rounded']
- );
- // buttonClasses might be: "bg-blue-500 hover:bg-blue-700 text-white p-2 rounded"
- ```
  */
  ```
