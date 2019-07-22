import R from "ramda";

import { withDefaults } from "./default_settings";
import proxy from "./proxy";
import reprocessor from "./reprocessor";


export function start(handleReady, options) {
  const finalOptions = withDefaults(options);
  const server = proxy(handleReady, finalOptions);
  console.log(`Listening on Port: ${finalOptions.port}`)
  return server;
}

export function rehash(options) {
  return reprocessor(withDefaults(options));
}
