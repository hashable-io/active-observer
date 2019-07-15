import R from "ramda";

import { DEFAULT_OPTIONS } from "./default_settings";
import proxy from "./proxy";
import reprocessor from "./reprocessor";

const withDefaults = R.merge(DEFAULT_OPTIONS);

export function start(options) {
  const finalOptions = withDefaults(options);
  const server = proxy(finalOptions);
  console.log(`Listening on Port: ${finalOptions.port}`)
  return server;
}

export function rehash(options) {
  return reprocessor(withDefaults(options));
}
