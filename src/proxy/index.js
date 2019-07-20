import url from "url";

import { Reader } from "monet";
import R from "ramda";

import * as client from "./client";
import * as cacheClient from "./cache";
import server from "./server";
import { ContentType, Headers, Modes } from "../constants"
import {
  attachCORSHeaders,
  standardizeHeaders,
  sortHeader,
  updateFormHeaders
} from "./headers"
import { otherwise } from "../utils";
import { parseJson } from "../utils/json";

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
      )(simplify(options, request))
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
  return Reader(options => client.fetch(request, response, options));
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
    .map(options => cacheClient.read(request, options))
    .map(pendingRead => { 
      pendingRead.then(payload => {
        // TODO: Set Response Headers etc.
        const cachePayload = Buffer.from(payload.response.body, 'hex');
        response.end(cachePayload);
      });
    });
}

function cache(request, response) {
  return Reader.ask()
    .map(options => client.fetch(request, response, options))
    .flatMap(pendingResponse => record(request, pendingResponse))
    .flatMap(pendingRecord =>  
      Reader(options => 
        pendingRecord.then(_ => repeat(request, response).run(options))
      )
    );
}

function record(request, pendingResponse) {
  return Reader(options => {
    return pendingResponse.then(remoteResponse => 
      cacheClient.record(request, remoteResponse, options)
    );
    // TODO: Handle Error.
  });
}

function notFound(request, response) {
  return Reader(options => {
    // TODO: Fill response with a default AO Message. 
  });
}


function isCached(options) {
  return request => cacheClient.isCached(request, options);
}

function simplify(options, request) {
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
  const isJson = R.always(R.compose(ContentType.isJson, R.prop("headers"))(request))
  const payload = R.ifElse(
    isJson,
    x => parseJson(x.toString("utf8")),
    x => x.toString("hex")
  )(data)

  return R.set(R.lensProp("body"), payload, request);
}

