import Hapi from '@hapi/hapi';
import Inert from '@hapi/inert';

let server = null;

export async function initTestServer(options) {
  options = options || {};
  const userHost = options.host || 'localhost';
  const userPort = options.port || 9001;
  server = Hapi.server({ 
    address: '0.0.0.0',
    host: userHost, 
    port: userPort 
  });
  await server.register(Inert);
};

export function addRoute(path, method, handler) {
  server.route({
    method: method,
    path: path,
    handler: handler.bind(this)
  });
};

export function stop() {
  server.stop({}, function () {});
};

export function start() {
  server.start((err) => {
    if (err) { throw err; }
  });
};

