import Hapi from 'hapi';
import inert from 'inert';

let server = null;

export async function initTestServer(options) {
  options = options || {};
  const userHost = options.host || 'localhost';
  const userPort = options.port || 9001;
  server = new Hapi.server({ host: userHost, port: userPort });
  await server.register(inert);
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

