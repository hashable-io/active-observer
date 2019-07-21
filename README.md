Active Observer :mag:
--------------------------

The Caching HTTP Proxy.


## Usage

Example Bootstrap Script:

```javascript
import { start } from "active-observer";

const handleReady = (options) => {
  console.log(`Server Ready...listening on port: ${options.port}`);
};

const options = {
  serverBaseUrl: "https://swapi.co",  // Destination address for our requests.
  cacheDir: "/temp/_cache/", // Location where cache files will be written.
  port: 9000 // Port our proxy will listen on.
};

// Start the proxy server for swapi.co:
start(handleReady, options);
```
