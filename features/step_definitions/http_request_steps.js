import http from 'http';

import { Given, Then, When } from 'cucumber';

const TIMEOUT = 20 * 1000;

When(/^I make a "([^"]*)" request to "([^"]*)"$/, function (method, path, done) {
  let options = {
    hostname: 'localhost',
    port: parseInt(this.options.port, 10),
    path: path,
    method: method
  };

  let req = http.request(options, (response) => {
    let data = [];
    this.status = response.statusCode;
    response.on('data', chunk => { data.push(chunk); });
    response.on('end', () => {
      this.result = Buffer.concat(data);
      done(data.length ? undefined : 'Empty Response');
    });
    response.on('error', error => { done('Error during request:' + error); });
  });
  req.on('error', error => { done('Error during request:' + error); });
  req.end();
});


Then(/^I can see (\d+) cache files for "([^"]*)"$/, function (count, path, done) {
  let files = this.cacheFiles(this.options.cacheDir, path);
  done(files.length == parseInt(count, 10) ? undefined : 'Expected to see ' + count + ' cache files, but found ' + files.length);
});


Then(/^I see the result "([^"]*)"$/, function (result, done) {
  let msg = [
    'Expected Result Not Found',
    'Expected: ' + result,
    'Found: ' + this.result
  ].join('\n');

  done(this.result.indexOf(result) > -1  ? undefined : msg);
});


When(/^I make a POST request to "([^"]*)" with the JSON body:$/, function (path, postData, done) {
  let options = {
    hostname: 'localhost',
    port: this.options.port,
    path: path,
    headers: {
      'content-type': 'application/json'
    },
    method: 'POST'
  };

  let req = http.request(options, function (response) {
    let data = [];
    response.on('data', chunk => data.push(chunk));
    response.on('end', () => {
      this.result = Buffer.concat(data);
      done(data.length ? undefined : 'Empty Response');
    });
    response.on('error', function () { done('Error during request.'); });
  });
  req.on('error', function () { done('Error during request.'); });
  req.write(JSON.stringify(JSON.parse(postData)));
  req.end();
});

When(/^I make a "([^"]*)" request to "([^"]*)" with headers:$/, { timeout: TIMEOUT }, function (method, urlPath, table, done) {
  let headers = {};

  table.rows().forEach(row => headers[row[0]] = row[1]);

  let options = {
    hostname: 'localhost',
    port: this.options.port,
    path: urlPath,
    method: method,
    headers: headers
  };

  let req = http.request(options, (response) => {
    let data = [];
    response.on('data', (chunk) => {
      data.push(chunk);
    });
    response.on('end', () => {
      this.result = Buffer.concat(data);
      done(data.length ? undefined : 'Empty Response');
    });
    response.on('error', (error) => { done('Error during request.' + error); });
  });
  req.on('error', (error) => { done('Error during request:' + error); });
  if (method == 'GET') {
    req.end();
  } else {
    req.end(JSON.stringify({ request: 'some-data' }));
  }
});


