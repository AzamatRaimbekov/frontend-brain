/\*\*

- **useClickOutside Hook**
-
- A custom React hook that detects and handles click events occurring outside a specified DOM element. This is particularly useful for components like modals, dropdowns, or tooltips, where clicking outside the component should trigger a specific action, such as closing the component.
-
- **Functionality:**
- - Attaches `mousedown` and `touchstart` event listeners to the document to detect clicks or touches outside the referenced element.
- - Invokes a callback function when a click or touch is detected outside the specified element.
- - Cleans up event listeners on component unmount to prevent memory leaks.
-
- **Parameters:**
- - `elementRef` (`RefObject<HTMLElement>`): A React ref object pointing to the DOM element that should detect outside clicks.
- - `callback` (`() => void`): A function to be executed when a click outside the referenced element is detected.
-
- **Usage Example:**
- ```javascript

  ```

- import React, { useRef, useState } from 'react';
- import { useClickOutside } from './useClickOutside';
-
- const Dropdown = () => {
- const [isOpen, setIsOpen] = useState(false);
- const dropdownRef = useRef(null);
-
- useClickOutside(dropdownRef, () => setIsOpen(false));
-
- return (
-     <div>
-       <button onClick={() => setIsOpen(!isOpen)}>Toggle Dropdown</button>
-       {isOpen && (
-         <div ref={dropdownRef}>
-           {/* Dropdown content */}
-         </div>
-       )}
-     </div>
- );
- };
- ```

  ```

-
- In this example:
- - A button toggles the visibility of a dropdown menu.
- - The `useClickOutside` hook is used to close the dropdown when a user clicks outside of it.
- - The `dropdownRef` is attached to the dropdown menu, and the callback function sets the `isOpen` state to `false` when an outside click is detected.

```javascript
    import { RefObject, useEffect } from 'react';

export const useClickOutside = (
elementRef: RefObject<HTMLElement>,
callback: () => void,
) => {
useEffect(() => {
const handleClickOutside = (event: MouseEvent | TouchEvent) => {
if (
elementRef.current &&
!elementRef.current.contains(event.target as Node)
) {
callback();
}
};

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };

}, [elementRef, callback]);
};
```
