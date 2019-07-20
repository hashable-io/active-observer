import R from "ramda";

export const LogLevels = {
  DEBUG: "debug",
  ERROR: "error",
  INFO: "info",
  NONE: "none",
  WARN: "warn"
};

export const CACHE_ENCODING = "base64";

export const Modes = {
  CACHE_ONLY: "cache_only",
  PROXY_ONLY: "proxy_only",
  PROXY_WITH_CACHE: "proxy_with_cache"
};

const ACCEPT = 'accept';
const AUTHORIZATION =  'authorization';
const CONTENT_TYPE = "content-type";
const CONTENT_LENGTH = "content-length";
// OPTIONS Headers
const ORIGIN = 'origin';
const ACCESS_CONTROL_REQUEST_METHOD = 'access-control-request-method';
const ACCESS_CONTROL_REQUEST_HEADERS = 'access-control-request-headers';
export const Headers = {
  ACCEPT,
  AUTHORIZATION,
  CONTENT_LENGTH,
  CONTENT_TYPE,
  ORIGIN,
  ACCESS_CONTROL_REQUEST_METHOD,
  ACCESS_CONTROL_REQUEST_HEADERS,
  corsHeadersWithOrigin: (origin = "*") => {
    return {
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "X-Requested-With,Content-Type,Accept,Origin,Authorization",
      "Access-Control-Allow-Methods": "HEAD,OPTIONS,GET,PUT,POST,DELETE",
      "Access-Control-Allow-Origin": origin || "*",
      "Access-Control-Max-Age": "1800"
    };
  },
}

export const HeadersWhitelist = {
  ACCEPT,
  ACCESS_CONTROL_REQUEST_METHOD,
  ACCESS_CONTROL_REQUEST_HEADERS,
  AUTHORIZATION,
  ORIGIN
}

const APPLICATION_JSON = "application/json";
const MULTIPART_FORM = "multipart/form-data";
const TEXT_PLAIN = "text/plain";
const TEXT_HTML = "text/html";

export const ContentType = {
  APPLICATION_JSON, 
  MULTIPART_FORM,
  TEXT_HTML,
  TEXT_PLAIN,
  get: R.view(R.lensProp(CONTENT_TYPE)),
  is: R.propEq(Headers.CONTENT_TYPE),
  isJson: R.propEq(CONTENT_TYPE, APPLICATION_JSON),
  isText: R.compose(
    R.flip(R.any)([
      R.propEq(CONTENT_TYPE, APPLICATION_JSON),
      R.propEq(CONTENT_TYPE, TEXT_HTML),
      R.propEq(CONTENT_TYPE, TEXT_PLAIN)
    ]),
    R.applyTo,
  )
}
