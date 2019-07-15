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
  let entries = R.toPairs(sortHeaders(headers));
  let transform = R.filter(R.apply(isInWhiteList));
  let reducer = (targetObj, [key, value]) => R.assoc(key, value, targetObj);
  
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


export function filterHeaders(cacheHeader) {
  return R.identity; // TODO: Implement filter fn
}

export function removeHeaders() {}
export function filterQueryParameters() {}

function updateBoundary(request) {
  let { headers, body } = request;
  if (!isFormData(headers)) {
    return request;
  }

  let oldBoundary = getBoundary(headers);
  let newBoundary = getNewBoundary(oldBoundary, body);

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

