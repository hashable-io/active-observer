import http from 'http';

import httpShutdown from 'http-shutdown';

import * as utils from "../utils";

function listen({ port, onRequest, onReady }) {
  const server = httpShutdown(http.createServer(onRequest));
  server.listen(port, onReady || utils.noop);
  return server;
}

export default { listen };
