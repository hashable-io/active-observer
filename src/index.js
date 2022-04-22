import R from "ramda";

import { withDefaults } from "./default_settings";
import proxy from "./proxy";
import * as utils from "./utils";


/**
 * Start the Active Observer Proxy.
 *
 * @param handleReady is a function that should be called when the proxy has started successfully.
 * @param options configuration object for the proxy. Requires `serverBaseUrl` and `cacheDir` as a minimum.
 */
export function start(handleReady, options) {
  const finalOptions = assertRequiredOptions(withDefaults(options));
  const server = proxy(handleReady || utils.noop, finalOptions);
  console.log(`Listening on Port: ${finalOptions.port}`)
  return server;
}

/**
 * Rehash the existing cache files to work with the new set of configuration settings.
 */
export function rehash(options) {
  // TODO: Not Implemented yet.
}


function assertRequiredOptions(options) {
  if (!options.serverBaseUrl) {
    throw Error("Expected 'serverBaseUrl' option to be set.");
  }

  if (!options.cacheDir) {
    throw Error("Expected 'cacheDir' option to be set.");
  }

  return options;
}
