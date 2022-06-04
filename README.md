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

## Options

## Required Options

`serverBaseUrl`: String URL of the server including the protocol. ie: `http://example.com`

`cacheDir`: String path to the directory on disk that cache should be written to.

## Other Options
`mode`: Enum (String) determining which mode the proxy should operate under.
Values can be: 
- `proxy_with_cache`: Brokers requests and writes each request and response to cache.
This is the default value.
- `cache_only`: Responds to requests with known cached responses only. Error is
returned for requests not previously seen.
- `proxy_only`: Brokers the request without writing to cache.

`hostAgnostic`: Boolean that determines if the host's name and port should be
used in the hash calculation. (Default: `true`)

`cacheAllRequestHeaders`: Boolean that prompts all headers to be considered for
cache hash calculation. (Default: `false`)


### Hook Functions:

`filterHeaders`: Predicate function that accepts a key-value pair to determine if the header
should be considered in the cache calculation, or saved to the cache record. 
(Default: `null`)


`mapHeaders`: Function that accepts and returns a key-value pair. The function transforms
the key and value of the header to a new value. (Default: `pair => pair`)


`cachePredicate`: Predicate function that accepts the request options, and a boolean indicating
whether the request has been cached to disk. This function is used to override the behaviour of 
Active Observer. If this function always returns false, then every incoming request is cached 
regardless of cache status. (Default: `null`)
