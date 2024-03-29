import R from "ramda";
import { LogLevels, Modes } from "./constants";

export const DEFAULT_OPTIONS = {
  contentTypesIgnored: [],
  headersTracked: [],
  hostAgnostic: true,
  ignoreJsonBodyPath: [],
  logLevel: LogLevels.INFO,
  mode: Modes.PROXY_WITH_CACHE,
  port: 9000,
  queryParametersIgnored: [],
  responseHeadersIgnored: [],
  // Hooks:
  filterHeaders: null, // [key, value] => Boolean
  mapHeaders: R.identity, // [key, value] => [key, value]
  cachePredicate: null, // (request, isCachedOnDisk) => Boolean
  cacheAllRequestHeaders: false, // TODO: Cosolidate with filterHeaders
};

export function withDefaults(other = {}) {
  return R.mergeRight(DEFAULT_OPTIONS, other);
}
