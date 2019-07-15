import R from 'ramda';

import crypto from 'crypto';
import qs from 'querystring';

import { sortObjectKeys } from './json';
import { filterHeaders } from '../proxy/headers';

const stringifyBody = R.when(
  R.has('body'),
  R.converge(
    R.assoc('body'), [
      R.compose(JSON.stringify, R.prop('body')),
      R.identity
    ]
  )
);

const composeSignature = R.compose(
  computeHash, 
  JSON.stringify, 
  sortObjectKeys, 
  stringifyBody
);

function computeHash (payload) {
  const shasum = crypto.createHash('sha1');
  shasum.update(payload);
  return shasum.digest('hex');
}

export function requestHash(request, options) {
  return composeSignature(filteredAttributes(request, options));
};

function filteredAttributes(request, options) {
  const { ignoreJsonBodyPath, queryParameterBlacklist, whiteLabel, cacheHeaders } = options;
  return R.compose(
    R.reduce(stubIgnoredJsonPaths, R.__, ignoreJsonBodyPath || []),
    R.reduce(removeBlacklistedQueryParams, R.__, queryParameterBlacklist || []),
    R.ifElse(R.always(whiteLabel), makeHostAndPortAgnostic, R.identity),
    R.converge(
      R.assoc('headers'), [
        R.compose(filterHeaders(cacheHeaders), R.prop('headers')),
        R.identity
      ]
    ),
  )(request);
};

function stubIgnoredJsonPaths (payload, path) {
  if (typeof (payload.body) !== 'object') {
    return payload;
  }

  const updatedPath = ['body'].concat(path.split('.'));
  const jsonPath = R.lensPath(updatedPath);

  return R.ifElse(
    R.view(jsonPath),
    R.set(jsonPath, JSON_STUBED_VALUE),
    R.identity
  )(payload);
}

function removeQueryParam (queryParam) {
  return (parameterString) => {
    const params = qs.parse(parameterString);
    const filteredParams = Object.keys(params).reduce((finalParams, key) => {
      if (key == queryParam) {
        return finalParams;
      }
      finalParams[key] = params[key];
      return finalParams;
    }, {});

    return '?' + qs.stringify(filteredParams);
  };
}

function removeBlacklistedQueryParams(payload, queryParam) {
  const { path } = payload;
  const [urlPath, parameters] = path.split('?');
  const newParameters = R.ifElse(
    R.isEmpty,
    R.always(''),
    removeQueryParam(queryParam)
  )(parameters);

  return R.assoc('path', urlPath + newParameters, payload);
}


const JSON_STUBED_VALUE = '---omitted-by-proxy---';
const HOST_AGNOSTIC_NAME = 'example.com';
const HOST_AGNOSTIC_PORT = 80;

const makeHostAndPortAgnostic = R.compose(
  R.assoc('hostname', HOST_AGNOSTIC_NAME),
  R.assoc('port', HOST_AGNOSTIC_PORT)
);


