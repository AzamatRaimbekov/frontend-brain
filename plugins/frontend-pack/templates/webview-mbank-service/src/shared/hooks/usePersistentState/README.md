**usePersistentState Hook**

A custom React hook that manages state persistence using `localStorage`. It ensures that state values remain stored across page reloads.

**Functionality:**

- Reads the initial state from `localStorage` or falls back to a provided default.
- Updates both React state and `localStorage` whenever the value changes.
- Handles errors gracefully during read/write operations.

**Parameters:**

- `key` (string): The `localStorage` key used for persistence.
- `initialValue` (T): The default value if no stored value exists.

**Returns:**

- `[storedValue, setValue]`: A stateful value and a setter function.

**Usage Example:**

```javascript
const [theme, setTheme] = usePersistentState('theme', 'light')

// Change the theme
setTheme('dark')
```
