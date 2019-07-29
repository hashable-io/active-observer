import R from "ramda";

import { withDefaults } from "./default_settings";
import proxy from "./proxy";


export function start(handleReady, options) {
  const finalOptions = assertRequiredOptions(withDefaults(options));
  const server = proxy(handleReady, finalOptions);
  console.log(`Listening on Port: ${finalOptions.port}`)
  return server;
}

export function rehash(options) {
  // TODO: Not Implemented yet.
}


function assertRequiredOptions(options) {
  if (!options.serverBaseUrl) {
    throw Error("Expected serverBaseUrl option to be set.");
  }

  if (!options.cacheDir) {
    throw Error("Expected cacheDir option to be set.");
  }

  return options;
}
