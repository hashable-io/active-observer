import fs from 'fs';
import http from 'http';
import querystring from 'querystring';

import { Then, When } from 'cucumber';
import { expect } from 'chai';
import R from 'ramda';

When('I make a {word} request to {string} with the query parameters:',
  function (method, rawPath, table, done) {
    const queryString = querystring.stringify(table.rowsHash());
    const path = queryString ? `${rawPath}?${queryString}` : rawPath;

    const options = {
      hostname: 'localhost',
      port: parseInt(this.options.port, 10),
      path,
      method
    };

    const req = http.request(options, response => {
      const data = [];
      response.on('data', chunk => data.push(chunk));
      response.on('end', () => {
        this.result = Buffer.concat(data);
        done(data.length ? undefined : 'Empty Response');
      });
      response.on('error', error => done('Error during request.' + error));
    });

    req.on('error', (error) => done('Error during request.' + error));
    req.end();
  }
);

Then("the {string} cache file doesn't contain the following query parameters:",
  function (path, table) {
    const blacklistedKeys = R.flatten(table.raw());
    const files = this.cacheFiles(this.options.cacheDir, path);

    if (files.length != 1) {
      // eslint-disable-next-line no-console
      console.error(`Expecting one file for form-data. ${files.length} found.`);
      return;
    }

    const fileContents = JSON.parse(fs.readFileSync(files[0], { encoding: 'utf-8' }));
    const requestPath = fileContents.request.path;

    const queryStringIndex = requestPath.indexOf('?');
    const thereAreNoQueryParameters = queryStringIndex === -1;

    if (thereAreNoQueryParameters) return;

    const queryString = requestPath.substr(queryStringIndex + 1);
    const queryParameterValues = querystring.parse(queryString);

    const queryParameterKeys = Object.keys(queryParameterValues);

    blacklistedKeys.forEach(key => {
      const errorMessage = `Expected "${key}" to not be in query string`;
      expect(queryParameterKeys.includes(key), errorMessage).to.be.false;
    });
  }
);
