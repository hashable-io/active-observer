import qs from 'querystring';

import R from "ramda";

import { ContentType, Headers, AllowedHeadersList } from "../constants"

const setValue = (targetObj, [key, value]) => R.assoc(key, value, targetObj)

export const isAllowedHeader = predicate => R.curry((key, value) => {
  return R.or(
      predicate(key, value), 
      R.and(
        R.includes(key, AllowedHeadersList),
        R.not(key === Headers.CONTENT_LENGTH && value === '0')
      )
  )
});

export function attachCORSHeaders(response, origin) {
  const { headers } = response;
  const updatedHeaders = R.pipe(
    R.toPairs,
    R.reduce(setValue, headers)
  )(Headers.corsHeadersWithOrigin(origin));

  return R.assoc("headers", updatedHeaders, response);
}

export function standardizeHeaders(headers, mapHeaders, filterHeaders) {
  const entries = R.pipe(
    sortHeaders,
    R.toPairs,
    R.map(mapHeaders)
  )(headers);

  const transform = R.filter(R.apply(isAllowedHeader(filterHeaders)));
  
  return R.transduce(transform, setValue, {}, entries);
}

export function sortHeaders(headers) {
  // Sort the keys to get predictable order
  return R.pipe(
    R.toPairs,
    R.map(([key, value]) => [R.toLower(key), value]),
    R.sortBy(([key, value]) => key),
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
  const keyIsIgnored = ([key, value]) => !R.includes(key, responseHeadersIgnored);

  return R.pipe(
    R.toPairs,
    R.filter(keyIsIgnored),
    R.fromPairs
  )(headers);
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

