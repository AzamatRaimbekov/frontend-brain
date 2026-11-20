/\*\*

- **OpenStreetMapApi**
-
- A utility module that provides functions to interact with the OpenStreetMap Nominatim API for geocoding and reverse geocoding operations.
-
- **Functionality:**
- - `searchStreet`: Performs a geocoding operation to find locations based on a query string.
- - `getAddressByCoords`: Performs a reverse geocoding operation to find an address based on latitude and longitude coordinates.
-
- **Methods:**
- - `searchStreet(query: string): Promise<SearchItem[]>`
- - **Parameters:**
-     - `query` (string): The search query string representing the address or place to look up.
- - **Returns:**
-     - A promise that resolves to an array of `SearchItem` objects containing the search results.
- - **Example:**
-     ```javascript
-     import { OpenStreetMapApi } from './path/to/OpenStreetMapApi';
-
-     const results = await OpenStreetMapApi.searchStreet('Bishkek, Chuy Avenue');
-     // results is an array of SearchItem objects
-     ```
- - **Note:**
-     - This function utilizes the Nominatim Search API to convert a query string into geographic data. The API supports both structured and free-form search queries. :contentReference[oaicite:0]{index=0}
-
- - `getAddressByCoords(lat: number, lon: number): Promise<AddressState | null>`
- - **Parameters:**
-     - `lat` (number): The latitude of the location.
-     - `lon` (number): The longitude of the location.
- - **Returns:**
-     - A promise that resolves to an `AddressState` object containing the address details, or `null` if no address is found.
- - **Example:**
-     ```javascript
-     import { OpenStreetMapApi } from './path/to/OpenStreetMapApi';
-
-     const address = await OpenStreetMapApi.getAddressByCoords(42.8746, 74.5698);
-     // address contains the address details for the given coordinates
-     ```
- - **Note:**
-     - This function utilizes the Nominatim Reverse Geocoding API to convert geographic coordinates into a human-readable address. The API finds the closest suitable OSM object and returns its address information. :contentReference[oaicite:1]{index=1}
-
- **Usage Policy:**
- - When making large numbers of requests, it's recommended to include an appropriate email address to identify your requests. Refer to Nominatim's Usage Policy for more details. :contentReference[oaicite:2]{index=2}
-
- **Example Usage:**
- ```javascript

  ```

- import { OpenStreetMapApi } from './path/to/OpenStreetMapApi';
-
- // Geocoding example
- OpenStreetMapApi.searchStreet('Bishkek, Chuy Avenue')
- .then(results => {
-     console.log('Search results:', results);
- })
- .catch(error => {
-     console.error('Error during search:', error);
- });
-
- // Reverse geocoding example
- OpenStreetMapApi.getAddressByCoords(42.8746, 74.5698)
- .then(address => {
-     console.log('Address:', address);
- })
- .catch(error => {
-     console.error('Error during reverse geocoding:', error);
- });
- ```

  ```

-
- **Note:**
- - Ensure that your application adheres to the usage policies of the Nominatim API, especially regarding rate limits and proper identification when making requests.
    \*/
