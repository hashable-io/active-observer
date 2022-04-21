import { When } from 'cucumber';

const minutes = () => 60 * 1000;
const twenty = (units) => 20 * units;

const DEFAULT_TIMEOUT = twenty(minutes());

When(/^I debug/, {timeout: DEFAULT_TIMEOUT }, function (done) {
  setTimeout(function() { done() }, DEFAULT_TIMEOUT);
});


