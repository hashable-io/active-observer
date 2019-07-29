import { Given, Then, When } from 'cucumber';
import R from "ramda";

import { start } from '../../src/index';

Given(/^I want to create a proxy instance with no options$/, function (done) {
  this.options = {};
  done();
});


const arrayValues = [
  "contentTypesIgnored",
	"headersTracked",
  "ignoreJsonBodyPath",
  "queryParametersIgnored",
  "responseHeadersIgnored"
];

Given(/^I want to create a proxy instance with the following options$/, function (optionsTable, done) {
  const input = optionsTable.rows();
  const updatedInput = input.map(row => {
    const [key, value] = row;
    const updatedValue = 
      R.contains(key, arrayValues) ? 
        value.split(",").map(_ => _.trim()) : 
        value;

    return [key, updatedValue];
  });
  const pendingAssoc = R.map(R.apply(R.assoc), updatedInput);
  const invokeAssoc = R.flip(R.call);
  this.options = R.reduce(invokeAssoc, {}, pendingAssoc);
  done();
})


When(/^I serve$/, function (done) {
  try {
    this.proxy = start(done, this.options);
  } catch (error) {
    this.error = error;
    done();
  }
});


When(/^I see an error asking me to specify missing options$/, function (done) {
  done(!this.error ? 'Expected Error for Missing Options!' : undefined);
});


Then(/^I see no error$/, function (done) {
  done(this.error ? 'Did Not Expec to See Error: ' + this.error : undefined);
});
