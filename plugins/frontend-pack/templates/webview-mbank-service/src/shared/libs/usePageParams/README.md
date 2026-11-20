**usePageParams Hook**

A custom React hook that retrieves and returns the current URL parameters using React Router's `useParams` function. This hook ensures type safety by explicitly casting the parameters to the `AllPageParams` type.

**Functionality:**

- Uses the `useParams` hook from `react-router-dom` to access dynamic URL parameters.
- Casts the retrieved parameters to the `AllPageParams` type, ensuring type safety in TypeScript projects.
- Returns an object containing all current URL parameters.

**Parameters:**

- This hook does not accept any parameters.

**Returns:**

- An object of type `AllPageParams`, containing all dynamic URL parameters extracted from the current route.

**Usage Example:**

```javascript
import { usePageParams } from './path/to/usePageParams'

function UserProfile() {
  const { userId } = usePageParams() // Example: Extract userId from URL

  return <div>User ID: {userId}</div>
}
```
