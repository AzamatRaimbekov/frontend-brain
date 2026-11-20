/\*\*

- **setGlobalDayjsLocale**
-
- A utility function that sets the global locale for Day.js to Russian ('ru').
-
- **Functionality:**
- - Imports the Russian locale from Day.js.
- - Sets the global locale to Russian using `dayjs.locale('ru')`.
-
- **Usage:**
- Call this function once in your application's entry point to set the global locale for all Day.js instances.
-
- **Example:**
- ```ts

  ```

- import { setGlobalDayjsLocale } from './path/to/your/utility';
-
- setGlobalDayjsLocale();
-
- // Now all Day.js instances will use Russian locale by default
- import dayjs from 'dayjs';
- console.log(dayjs().format('MMMM D, YYYY')); // Outputs date in Russian format
- ```

  ```

-
- **Note:**
- Ensure that the Russian locale is properly imported before setting it as the global locale. Changing the global locale does not affect existing Day.js instances. :contentReference[oaicite:0]{index=0}
  \*/
