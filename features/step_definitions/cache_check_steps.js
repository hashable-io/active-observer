import fs from 'fs';
import http from 'http';

import { Then, When } from 'cucumber';
import { expect } from 'chai';

Then(/^I see a cache file for "([^"]*)" with the following headers:$/, function (path, table, done) {
  let files = this.cacheFiles(this.options.cacheDir, path);
  if (files.length != 1) {
    done('Expecting 1 file for form-data. ' + files.length + ' found');
    return;
  }

  let generatedJSON = JSON.parse(fs.readFileSync(files[0], { encoding: 'utf-8' }));
  let requiredHeadersFound = true;

  table.rows().forEach(function (row) {
    requiredHeadersFound = requiredHeadersFound
      && generatedJSON.request.headers[row[0]]
      && generatedJSON.request.headers[row[0]] == row[1];
  });

  done(!requiredHeadersFound ? 'Missing Headers' : null);
});

Then('I can see one cache file for {string}', function (path) {
  const files = this.cacheFiles(this.options.cacheDir, path);
  const errorMsg = `Expecting 1 file for form-data. ${files.length} found`;

  expect(files.length, errorMsg).to.equal(1);
});
