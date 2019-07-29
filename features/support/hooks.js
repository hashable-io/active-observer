import { After, Before } from 'cucumber';
import * as TestServer from './test_server';

Before('@TestServer', async function () {
  let world = this;
  world.serverState = { count: 0 };
  await TestServer.initTestServer();

  TestServer.addRoute('/routeWith500', 'GET', function () {
    return new Error('Here is an error you expected.');
  });

  TestServer.addRoute('/formData', 'POST', function () {
    return { status: 'success' };
  });

  TestServer.addRoute('/getCount', 'GET', function () {
    return world.serverState.count;
  });

  TestServer.addRoute('/increment', 'GET', function () {
    world.serverState.count = world.serverState.count + 1;
    return 'incremented';
  });

  TestServer.addRoute('/jsonRequest', 'POST', function () {
    return { status: 'success' };
  });

  TestServer.addRoute('/queryStringRequest', 'GET', function () {
    return { status: 'success' };
  });

  TestServer.addRoute('/cacheHeader', 'POST', function () {
    return { status: 'success' };
  });

  TestServer.addRoute('/image', 'GET', function (req, h) {
    return h.file(__dirname + '/test.png').type('image/png');
  });

  TestServer.start();
});


After('@TestServer', function () {
  const world = this;
  world.serverState.count = 0;
  TestServer.stop();
});
