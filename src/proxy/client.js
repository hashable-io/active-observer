import R from "ramda";

import http from 'http';
import https from 'https';

import { ContentType } from "../constants";
import { otherwise } from "../utils";

export function fetch(options, response) {
  return new Promise((resolve, reject) => {
    const protocolHandler = options.port == 443 ? https : http;
    const onConnectionEstablished = onRequestEstablished(options, response, resolve, reject);
    const onErrorConnecting = onRequestError(options, resolve, reject);
    const remoteRequest = protocolHandler.request(options, onConnectionEstablished);
    const writeData = data => remoteRequest.write(data);
    const bodyIsNotNil = R.compose(R.not, R.isNil, R.prop("body")); 

    remoteRequest.on('error', onErrorConnecting);
    // Forward Request Body
    R.when(bodyIsNotNil, R.pipe(getFormattedRequestBody, writeData))(options);
    remoteRequest.end();
  });
};


function onRequestEstablished(options, response, resolve, reject) {
  return (remoteServerResponse) => 
    this.accumulateResponse(remoteServerResponse, options, resolve, reject);
}


function accumulateResponse(remoteServerResponse, options, resolve, reject) {
  const { headers, statusCode } = remoteServerResponse;
  const isJson = ContentType.isJson(headers)
  const contentType = ContentType.get(headers);
  const responseData = [];
  remoteServerResponse.on('data', chunk => responseData.push(chunk));
  remoteServerResponse.on('end', function () {
    const payload = Buffer.concat(responseData);
    const data = options.method == 'OPTIONS' || !isJson ? payload.toString("hex") : parseJson(payload.toString("utf8"));
    resolve({
      data,
      headers,
      request: options,
      status: statusCode,
      type: contentType || ContentType.TEXT_PLAIN
    });
  });

  remoteServerResponse.on('error', function () {
    reject('Unable to load data from request.');
  });
};

function getFormattedRequestBody({ body, headers }) {
  R.cond([
    R.pair(ContentType.isJson, _ => JSON.stringify(body)),
    R.pair(ContentType.isText, _ => body),
    R.pair(otherwise,          _ => Buffer.from(body, "hex"))
  ])(headers)
}
