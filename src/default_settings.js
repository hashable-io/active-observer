import { LogLevels, Modes } from "./constants";

export const DEFAULT_OPTIONS = {
  contentTypesIgnored: [],
  headersTracked: [],
  hostAgnostic: true,
  logLevel: LogLevels.INFO,
  mode: Modes.PROXY_WITH_CACHE,
  port: 9000
};
