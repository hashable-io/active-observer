import url from "url";

import { Reader } from "monet";
import R from "ramda";

import * as client from "./client";
import * as diskCacheClient from "../cache/disk";
import server from "./server";
import { ContentType, Headers, Modes, CACHE_ENCODING } from "../constants"
import { otherwise } from "../utils";
import {
  attachCORSHeaders,
  standardizeHeaders,
  sortHeader,
  updateFormHeaders
} from "../utils/headers"

export default function proxy(handleReady, options) {
  console.log('Starting Proxy')
  return server.listen({ 
    onReady: handleReady,
    onRequest: handleRequest(options),
    port: options.port
  });
}


///////////////////////////////////////////////////////////////////////////////
// Helper Functions:
///////////////////////////////////////////////////////////////////////////////

/**
 * Entry Point for Requests
 **/
function handleRequest(options) {
  return (request, response) => {
    R.compose(
      R.curry(attachCORSHeaders)(response), 
      R.view(R.lensPath(["headers", "origin"]))
    )(request)

    const echoToResponse = R.flip(R.curry(echo))(response);
    const setBody = R.curry(updateWithParsedBody);

    // Finish Receiving Payload
    const data = [];
    request.on('data', chunk => data.push(chunk));
    request.on('end', () => {
      const payload = Buffer.concat(data);
      R.pipe(
        updateFormHeaders,
        setBody(payload),
        simplifiedRequest => echoToResponse(simplifiedRequest).run(options) // async action
      )(simplify(request, options))
    });
  };
};

function echo(request, response) {
  return Reader(options => options.mode).flatMap(
    R.cond([
      R.pair(R.equals(Modes.PROXY_WITH_CACHE), _ => proxyWithCache(request, response)),
      R.pair(R.equals(Modes.PROXY_ONLY),       _ => proxyOnly(request, response)),
      R.pair(R.equals(Modes.CACHE_ONLY),       _ => cacheOnly(request, response)),
      R.pair(otherwise,                        _ => { throw Error("Unknown Mode Specified.") })
    ])
  );
}

function proxyWithCache(request, response) {
  return Reader.ask().flatMap(options => 
    R.cond([
      R.pair(isCached(options), _ => repeat(request, response)),
      R.pair(otherwise,         _ => cache(request, response))
    ])(request)
  );
}

function proxyOnly(request, response) {
  return Reader(options => { 
    const pendingFetch = client.fetch(request, response, options);
    R.then(writeReponse(response))(pendingFetch);
  });
}

function cacheOnly(request, response) {
  return Reader.ask().flatMap(options => 
    R.cond([
      R.pair(isCached(options), _ => repeat(request, response)),
      R.pair(otherwise,         _ => notFound(request, response))
    ])(request)
  );
}


function repeat(request, response) {
  return Reader.ask()
    .map(options => diskCacheClient.read(request, options))
    .map(R.then(writeReponse(response)));
}

function writeReponse(response) {
  return payload => {
    const { body, headers, status, type } = payload.response;
    const cachePayload = Buffer.from(body, CACHE_ENCODING);
    const cachedHeader = { ...headers, [Headers.CONTENT_TYPE]: type};

    response.writeHead(status, cachedHeader);
    response.end(cachePayload);
  };
}

function cache(request, response) {
  return Reader.ask()
    .map(options => client.fetch(request, response, options))
    .flatMap(pendingResponse => record(request, pendingResponse))
    .flatMap(pendingRecord =>  
      Reader(options => 
        pendingRecord
          .then(_ => repeat(request, response).run(options))
          .catch(handleErrorRepeating(request, response))
      )
    );
}

function record(request, pendingResponse) {
  return Reader(options => {
    return pendingResponse
      .then(remoteResponse => diskCacheClient.record(request, remoteResponse, options))
      .catch(handleErrorRecording(request, pendingResponse));
  });
}

function handleErrorRecording(request, response) {
  return error => {
    console.log("Error occurred while trying to record response to cache.");
    console.log("Error: ", e);
  };
}

function handleErrorRepeating(request, response) {
  return error => {
    console.log("Error occurred while trying to repeat response to cache.");
    console.log("Error: ", e);
  };
}

function notFound(request, response) {
  return Reader(options => {
    // TODO: Fill response with a default AO Message. 
  });
}

function isCached(options) {
  return request => diskCacheClient.isCached(request, options);
}

function simplify(request, options) {
  const { serverBaseUrl } = options;
  const { hostname, path, port, protocol } = url.parse(serverBaseUrl + request.url);

  return {
    headers: standardizeHeaders(request.headers),
    hostname,
    method: request.method,
    path,
    port: parseInt(port) || (protocol === 'https:' ? 443 : 80)
    // TODO: Implement Transaction State
  };
}

function updateWithParsedBody(data, request) {
  const payload = data.toString(CACHE_ENCODING);
  return R.set(R.lensProp("body"), payload, request);
}

