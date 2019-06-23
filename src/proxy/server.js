import http from 'http';
import httpShutdown from 'http-shutdown';

function listen({ port, onRequest, onReady }) {
  let server = httpShutdown(http.createServer(onRequest));
  server.listen(port, onReady || utils.noop);
  return server;
}

export default { listen };
