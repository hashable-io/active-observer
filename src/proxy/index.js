import url from "url";
import R from "ramda";

import client from "./client";
import server from "./server";
import { ContentType, Headers, Modes } from "../constants"
import {
  attachCORSHeaders,
  standardizeHeaders,
  sortHeader,
  updateFormHeaders
} from "./headers"
import { parseJson } from "../utils";

export default function proxy(options) {
  const { port, handleReady } = options;
  const worker = server.listen({ 
    port: options.port, 
    handleRequest: R.curry(handleRequest)(options), 
    handleReady: options.handleReady 
  });
  return server
}


///////////////////////////////////////////////////////////////////////////////
// Helper Functions:
///////////////////////////////////////////////////////////////////////////////

/**
 * Entry Point for Requests
 **/
function handleRequest(options, request, response) {
  R.compose(
    R.curry(attachCORSHeaders)(response), 
    R.view(R.lensPath(["headers", "origin"]))
  )(request)

  const echoWithOptions = R.flip(R.curry(echo)(options))(response);
  const setBody = R.curry(updateWithParsedBody);

  // Finish Receiving Payload
  const data = [];
  request.on('data', chunk => data.push(chunk));
  request.on('end', () => {
    const payload = Buffer.concat(data);
    R.pipe(
      updateFormHeaders,
      setBody(payload),
      echoWithOptions
    )(simplify(options, request))
  });
}

const otherwise = R.T;

function echo(options, request, response) {
  R.cond([
    R.pair(R.equals(Modes.PROXY_WITH_CACHE), _ => proxyWithCache(options, request, response)),
    R.pair(R.equals(Modes.PROXY_ONLY),       _ => proxyOnly(options, request, response)),
    R.pair(R.equals(Modes.CACHE_ONLY),       _ => cacheOnly(options, request, response)),
    R.pair(otherwise,                        _ => { throw Error("Unknown Mode Specified.") })
  ])(options.mode)
}

const proxyWithCache = R.curry((options, request, response) => {
  return R.cond([
    R.pair(isCached,  _ => repeat(options, request, response)),
    R.pair(otherwise, _ => cache(options, request, response))
  ])(request);
});

const proxyOnly = R.curry((options, request, response) => {
  return client.fetch(options, response)
});

const cacheOnly = R.curry((options, request, response) => {
  return R.cond([
    R.pair(isCached,  _ => repeat(options, request, response)),
    R.pair(otherwise, _ => notFound(options, request, response))
  ])(request);
});


function repeat(options, request, response) {

}

function cache(options, request, response) {
  return R.then(R.curry(record)(request))(client.fetch(options, response));
}

function record(request, remoteResponse) {
  // TODO
}

function notFound(options, request, response) {
  // TODO: Fill response with a default AO Message. 
}

function isCached(request) {
  // TODO: Fill in
  return false;
}

function simplify(options, request) {
  const { serverBaseUrl } = options;
  const { headers, method, url } = request; 
  const { hostname, path, port, protocol } = url.parse(serverBaseUrl + url);

  return {
    headers: standardizeHeaders(headers),
    hostname,
    method,
    path,
    port: parseInt(port) || (protocol === 'https:' ? 443 : 80),
    transaction: this.transactionState.get(path, method)
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

