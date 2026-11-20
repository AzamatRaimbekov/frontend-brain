**TokenStorage Utility**

A utility module that provides methods for securely storing, retrieving, and deleting tokens using either `localStorage` or `sessionStorage`.

**Functionality:**

- Saves a token to either `localStorage` (persistent storage) or `sessionStorage` (temporary storage for the session).
- Retrieves a token, first checking `localStorage` and falling back to `sessionStorage`.
- Checks if a token is saved in `localStorage`.
- Deletes the stored token from both `localStorage` and `sessionStorage`.

**Methods:**

- `saveToStorage({ saveLocal, value, key })`: Saves the provided token. If `saveLocal` is `true`, stores it in `localStorage`; otherwise, stores it in `sessionStorage`.
- `getFromStorage(key)`: Retrieves the token from storage, prioritizing `localStorage` over `sessionStorage`.
- `isSaved(key)`: Checks if a token exists in `localStorage`.
- `deleteStorage()`: Deletes the token from both `localStorage` and `sessionStorage`.

**Usage Example:**

```javascript
// Save token to sessionStorage
TokenStorage.saveToStorage({ saveLocal: false, value: 'abc123' })

// Save token to localStorage
TokenStorage.saveToStorage({ saveLocal: true, value: 'abc123' })

// Get token from storage
const token = TokenStorage.getFromStorage()
console.log(token) // Output: 'abc123'

// Check if token is saved in localStorage
const isTokenSaved = TokenStorage.isSaved()
console.log(isTokenSaved) // Output: true or false

// Delete token from storage
TokenStorage.deleteStorage()
```
