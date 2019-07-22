import qs from 'querystring';

import R from "ramda";

import { ContentType, Headers, HeadersWhitelist } from "../constants"

export const isInWhiteList = R.curry((key, value) => {
  return R.and(
    R.includes(key, R.keys(HeadersWhitelist)),
    R.not(key === Headers.CONTENT_LENGTH && value === '0')
  )
});

export function attachCORSHeaders(response, origin) {
  R.forEachObjIndexed(
    (value, key) => response.setHeader(key, value),
    Headers.corsHeadersWithOrigin(origin)
  )
}

export function standardizeHeaders(headers) {
  const entries = R.toPairs(sortHeaders(headers));
  const transform = R.filter(R.apply(isInWhiteList));
  const reducer = (targetObj, [key, value]) => R.assoc(key, value, targetObj);
  
  return R.transduce(transform, reducer, {}, entries);
}

export function sortHeaders(headers) {
  const setValue = (targetObj, key) => R.assoc(key, headers[key], targetObj)

  // Sort the keys to get predictable order
  return R.pipe(
    R.keys,
    R.map(R.toLower),
    R.sortBy(R.identity),
    R.reduce(setValue, {})
  )(headers);
}

export function updateFormHeaders(request) {
  return R.ifElse(
    R.compose(ContentType.is(ContentType.MULTIPART_FORM), R.prop("headers")),
    updateBoundary,
    R.identity
  )(request);
}


export function filterHeaders(request, options) {
  const { headersTracked } = options;
  function keepWanted(targetObj, key) { 
    const value = request.headers[key];
    return R.when(
      R.always(value), 
      R.assoc(key, value)
    )(targetObj);
  }

  return R.reduce(keepWanted, {}, headersTracked);
}

export function removeHeaders(response, options) {
  const { responseHeadersIgnored } = options;
  const { headers } = response;
  return {};
}

export function filterQueryParameters(request, options) {
  const { queryParametersIgnored } = options;
  const { path } = request;
  const ignoreList = R.map(R.trim)(queryParametersIgnored);
  const [host, queryString = ""] = path.split('?');
  const filteredQueryString = R.pipe(
    qs.parse,
    R.omit(ignoreList),
    qs.stringify,
  )(queryString);
  const isNonFalsey = R.identity

  return R.filter(isNonFalsey, [host, filteredQueryString]).join("?");
}

function updateBoundary(request) {
  const { headers, body } = request;
  if (!isFormData(headers)) {
    return request;
  }

  const oldBoundary = getBoundary(headers);
  const newBoundary = getNewBoundary(oldBoundary, body);

  return R.compose(
    setHeaderBoundary(oldBoundary, newBoundary),
    setBodyBoundary(oldBoundary, newBoundary)
  )(request);
}

const isFormData = R.ifElse(
  R.has(Headers.CONTENT_TYPE),
  R.over(R.lensProp(Headers.CONTENT_TYPE), x => x.match(ContentType.MULTIPART_FORM)),
  R.F
);

