**Session Storage Utilities**

A collection of utility functions to interact with the browser's `sessionStorage`, providing methods to set, retrieve, and remove data, as well as a factory function to create namespaced storage handlers.

**Functions:**

- `setSessionStorage`: Stores a key-value pair in `sessionStorage`.
- `getSessionStorage`: Retrieves the value associated with a key from `sessionStorage`.
- `deleteSessionStorage`: Removes a key and its associated value from `sessionStorage`.
- `sessionStorageFactory`: Creates a namespaced storage handler with `get`, `set`, and `remove` methods.

**Usage Example:**

```javascript
// Setting a value
setSessionStorage({ key: 'username', value: 'john_doe' })

// Getting a value
const username = getSessionStorage('username')
console.log(username) // Output: 'john_doe'

// Deleting a value
deleteSessionStorage('username')

// Using the sessionStorageFactory
const userStorage = sessionStorageFactory('user')
userStorage.set('profile', { name: 'John Doe', age: 30 })
const profile = userStorage.get('profile')
console.log(profile.name) // Output: 'John Doe'
userStorage.remove('profile')
```
