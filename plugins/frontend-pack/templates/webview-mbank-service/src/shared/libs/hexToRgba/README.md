/\*\*

- **hexToRgba**
-
- A utility function that converts a hexadecimal color code to its equivalent RGBA color representation.
-
- **Functionality:**
- - Validates the input hexadecimal color code to ensure it matches standard 3 or 6-character formats, optionally prefixed with a '#'.
- - Converts the hexadecimal color code to its RGB components.
- - Combines the RGB components with the specified opacity to produce an RGBA color string.
-
- **Parameters:**
- @param {string} hex - The hexadecimal color code to convert. It can be in the format '#RRGGBB', 'RRGGBB', '#RGB', or 'RGB'.
- @param {number} [opacity=1] - The opacity level for the resulting RGBA color. Must be a number between 0 and 1. Defaults to 1 (fully opaque).
-
- **Returns:**
- @returns {string} The corresponding RGBA color string in the format 'rgba(r, g, b, a)'.
-
- **Throws:**
- - Will throw an error if the `hex` parameter is not a valid hexadecimal color code.
- - Will throw an error if the `opacity` parameter is not between 0 and 1.
-
- **Example:**
- ```javascript

  ```

- import { hexToRgba } from './path/to/hexToRgba';
-
- const rgbaColor = hexToRgba('#3498db', 0.5);
- // rgbaColor === 'rgba(52, 152, 219, 0.5)'
- ```

  ```

-
- **Note:**
- - This function supports both 3-digit and 6-digit hexadecimal color codes, with or without a leading '#'.
- - The opacity parameter allows for transparency control in the resulting RGBA color.
