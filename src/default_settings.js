import R from "ramda";
import { LogLevels, Modes } from "./constants";

export const DEFAULT_OPTIONS = {
  contentTypesIgnored: [],
  headersTracked: [],
  filterHeaders: R.F,
  mapHeaders: R.identity,
  hostAgnostic: true,
  ignoreJsonBodyPath: [],
  logLevel: LogLevels.INFO,
  mode: Modes.PROXY_WITH_CACHE,
  port: 9000,
  queryParametersIgnored: [],
  responseHeadersIgnored: []
};

export function withDefaults(other = {}) {
  return R.mergeRight(DEFAULT_OPTIONS, other);
}
