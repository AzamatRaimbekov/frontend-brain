/\*\*

- **twMerge**
-
- A utility function designed to efficiently merge multiple Tailwind CSS class strings into a single string, resolving conflicts by retaining only the last occurrence of conflicting classes.
-
- **Functionality:**
- - Accepts multiple class name arguments, which can be strings or arrays of strings.
- - Merges these class names into a single string.
- - Resolves conflicts by retaining the last specified class when multiple classes that apply to the same CSS property are present.
-
- **Parameters:**
- @param {...(string | undefined | null | false | 0 | Array<string | undefined | null | false | 0>)} classLists - Multiple class name arguments to be merged.
-
- **Returns:**
- @returns {string} A single string containing the merged class names with conflicts resolved.
-
- **Example Usage:**
- ```javascript

  ```

- import { twMerge } from 'tailwind-merge';
-
- const buttonClass = twMerge('px-2 py-1 bg-red hover:bg-dark-red', 'p-3 bg-[#B91C1C]');
- // buttonClass === 'hover:bg-dark-red p-3 bg-[#B91C1C]'
- ```

  ```

-
- **Note:**
- - `twMerge` is particularly useful in scenarios where dynamic class names are constructed based on component props or state, ensuring that the final class string does not contain conflicting Tailwind CSS classes.
- - For more advanced configurations or to extend the default behavior, consider using the `extendTailwindMerge` function provided by the `tailwind-merge` library.
