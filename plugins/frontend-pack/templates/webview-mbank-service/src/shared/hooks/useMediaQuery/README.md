/\*\*

- **useMediaQuery Hook**
-
- A custom React hook that monitors and responds to changes in media queries, enabling responsive design within functional components. This hook provides real-time feedback on media query matches and tracks specific viewport breakpoints.
-
- **Functionality:**
- - **Media Query Matching:** Accepts a media query string and returns a boolean indicating whether the document matches the query.
- - **Breakpoint Monitoring:** Tracks common viewport breakpoints (mobile, tablet, laptop, desktop, widescreen) and returns their match statuses.
- - **Event Listener Management:** Attaches and cleans up event listeners to handle changes in media query matches efficiently.
-
- **Parameters:**
- - `settings` (optional): An object of type `MediaQuerySettings` that can include:
- - `query`: A custom media query string.
- - Other media feature properties (e.g., `minWidth`, `maxWidth`) to construct a media query.
- - `onChange` (optional): A callback function that receives the current match status (`true` or `false`) whenever the media query's evaluated result changes.
-
- **Returns:**
- - An object containing:
- - `matches`: A boolean or `null` indicating if the media query matches the current document state.
- - `breakpointMatches`: An object with boolean values indicating the match status of predefined breakpoints:
-
- **Usage Example:**
- ```javascript

  ```

- import useMediaQuery from './useMediaQuery';
-
- function ResponsiveComponent() {
- const { matches, breakpointMatches } = useMediaQuery(
-     { minWidth: 768 }, // Custom media query settings
-     (match) => {
-       console.log('Media query match status:', match);
-     }
- );
-
- return (
-     <div>
-       {matches ? (
-         <p>The viewport is at least 768 pixels wide.</p>
-       ) : (
-         <p>The viewport is less than 768 pixels wide.</p>
-       )}
-       {breakpointMatches.isMobile && <p>Viewing on a mobile device.</p>}
-       {breakpointMatches.isTablet && <p>Viewing on a tablet device.</p>}
-       {/* Additional content based on breakpoints */}
-     </div>
- );
- }
- ```

  ```

-
- In this example:
- - The `useMediaQuery` hook is used to determine if the viewport width is at least 768 pixels.
- - It also provides information about whether the current device matches common breakpoints (mobile, tablet, etc.).
- - The component renders different content based on the viewport size and device type.
-
- **Notes:**
- - **Server-Side Rendering (SSR):** This hook relies on the `window` object and is intended for client-side use. Ensure that it is not invoked during server-side rendering to avoid errors.
- - **Performance Considerations:** The hook efficiently manages event listeners to minimize performance overhead. However, be mindful of adding multiple instances of this hook, as each will attach its own event listeners.
- - **Customization:** The `settings` parameter allows for flexible media query definitions. If a `query` string is provided, it takes precedence over other settings.
