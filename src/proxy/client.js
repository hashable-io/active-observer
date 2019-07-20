import R from "ramda";

import http from 'http';
import https from 'https';

import { ContentType, CACHE_ENCODING } from "../constants";
import { regExArrayContains, otherwise } from "../utils";
import { parseJson } from "../utils/json";

export function fetch(request, response, options) {
  return new Promise((resolve, reject) => {
    const protocolHandler = request.port == 443 ? https : http;
    const onConnectionEstablished = onRequestEstablished(options, request, response, resolve, reject);
    const onErrorConnecting = onRequestError(options, request, resolve, reject);
    const remoteRequest = protocolHandler.request(request, onConnectionEstablished);
    
    const writeData = data => remoteRequest.write(data);
    const bodyIsNotNil = R.compose(R.not, R.isNil, R.prop("body")); 

    remoteRequest.on('error', onErrorConnecting);
    R.when(bodyIsNotNil, R.pipe(getFormattedRequestBody, writeData))(request);
    remoteRequest.end();
  });
};


function onRequestEstablished(options, request, response, resolve, reject) {
  return (remoteServerResponse) => accumulateResponse(remoteServerResponse, request, resolve, reject);
}


function accumulateResponse(remoteServerResponse, originalRequest, resolve, reject) {
  const { headers, statusCode } = remoteServerResponse;
  const isJson = ContentType.isJson(headers)
  const contentType = ContentType.get(headers);
  const responseData = [];
  remoteServerResponse.on('data', chunk => responseData.push(chunk));
  remoteServerResponse.on('end', () => {
    const payload = Buffer.concat(responseData);
    resolve({
      request: originalRequest,
      response: {
        body: payload.toString(CACHE_ENCODING),
        headers,
        status: statusCode,
        type: contentType || ContentType.TEXT_PLAIN
      }
    });
  });

  remoteServerResponse.on('error', () => {
    reject('Unable to load data from request.');
  });
};

function getFormattedRequestBody({ body, headers }) {
  return R.cond([
    R.pair(otherwise,          _ => Buffer.from(body, CACHE_ENCODING))
  ])(headers);
}

function onRequestError(options, request, resolve, reject) {
  return (error) => {
    const isIgnoredContentType = regExArrayContains(options.contentTypesIgnored, request.headers.accept);
    switch (error.code) {
      case 'ENOTFOUND':
        if (!isIgnoredContentType) {
          console.log('Unable to Connect to Host.');
          console.log('Check the Domain Spelling and Try Again.');
          console.log('No Data Saved for Request.');
        }
        break;
    }

    if (isIgnoredContentType) {
      reject(false);
    } else {
      reject(error);
    }
  };
}
