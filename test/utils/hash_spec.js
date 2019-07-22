import R from "ramda";
import { expect } from "chai";

import { requestHash } from "../../src/utils/hash";
import { withDefaults } from "../../src/default_settings";
  
const exampleRequestA = {
  hostname: 'swapi.co',
  path: '/api/',
  port: 80,
  headers: { 'authorization': '12345', 'content-type': 'application/json' },
  body: ''
};

const exampleRequestADomainB = {
  hostname: 'notarealdomain.com',
  path: '/api/',
  port: 8080,
  headers: { 'authorization': '12345', 'content-type': 'application/json' },
  body: ''
};

const exampleRequestB = {
  hostname: 'swapi.co',
  path: '/api/people/1/',
  port: 80,
  headers: { 'authorization': '98745', 'content-type': 'application/json' },
  body: ''
};

describe("requestHash", function() {
  context("hostAgnostic: false", function () {
    it('should NOT be equal', function () {
      const options = withDefaults({ hostAgnostic: false });
      const hashA = requestHash(exampleRequestA, options);
      const hashB = requestHash(exampleRequestADomainB, options);

      // NOTE: Changing Hashes Means a Break in API. 
      expect(hashA).to.equal("51df6dd00e6a4fde6f402136a5f1218739e2e154")
      expect(hashB).to.equal("18633da8d9e95a02c7e531ba9f4f27d2d712faaf")

      expect(hashA).to.not.equal(hashB);
    });
  });

  context("hostAgnostic: true", function () {
    it('should be equal', function () {
      const options = withDefaults({ hostAgnostic: true }); 
      const hashA = requestHash(exampleRequestA, options);
      const hashB = requestHash(exampleRequestADomainB, options);

      // NOTE: Changing Hashes Means a Break in API. 
      expect(hashA).to.equal("9296469b06c757c16c7998e5f24cc1388dd3e01d")

      expect(hashA).to.equal(hashB);
    });
  });

  context("queryParametersIgnored", function(){
    const exampleWithQueryParams = {
      hostname: 'swapi.co',
      path: '/api/people/1/?secret=sauce&public=secret',
      port: 80,
      headers: { 'authorization': '98745', 'content-type': 'application/json' },
      body: ''
    };

    it("should have an effect on the generated hash", function() {
      const getHash = R.compose(R.curry(requestHash)(exampleWithQueryParams), withDefaults);
      const hashSansFlag = getHash(undefined);
      const hashSansSecret = getHash({ queryParametersIgnored: ['secret'] });
      const hashSansPublic = getHash({ queryParametersIgnored: ['public'] });


      // NOTE: Changing Hashes Means a Break in API. 
      expect(hashSansFlag).to.equal("de0efb4b706be10a1bb2e1972c71e0146d2aaa43")
      expect(hashSansPublic).to.equal("73ce1ebc8421fcd0636069c8bd1913b7aa8b8e10")
      expect(hashSansSecret).to.equal("808f76ba5e48f169daeaede68dd65548a1c3d523")

      expect(hashSansFlag).to.not.equal(hashSansSecret);
      expect(hashSansFlag).to.not.equal(hashSansPublic);
      expect(hashSansPublic).to.not.equal(hashSansSecret);
    });
  });
});
