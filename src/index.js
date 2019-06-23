import R from "ramda";

import { DEFAULT_OPTIONS } from "./default_settings";
import proxy from "./proxy";
import reprocessor from "./reprocessor";

const withDefaults = R.merge(DEFAULT_OPTIONS)

export function start(options) {
  return R.compose(proxy, withDefaults)(options)
}

export function rehash(options) {
  return R.compose(reprocessor, withDefaults)(options)
}
