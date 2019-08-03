import R from "ramda";
import { expect } from "chai";

import * as util from "../../src/utils/headers";
import { ContentType, Headers, AllowedHeadersList } from "../../src/constants";
import { withDefaults } from "../../src/default_settings";
import * as testUtils from "./utils";

describe("isAllowedHeader", function() {
  AllowedHeadersList.forEach(header => {
    context(`allowed headers ${header}`, function() {
      it("returns true", function() {
        expect(util.isAllowedHeader(header, testUtils.randString())).to.be.true
      });
    });
  });

  context("other header values", function() {
    it(`it returns false for ${Headers.CONTENT_LENGTH}`, function() {
      expect(util.isAllowedHeader(Headers.CONTENT_LENGTH, testUtils.randString())).to.be.false
    });

    it(`it returns false for other values`, function() {
      Array(1000).fill(0).forEach(_ => {
        expect(util.isAllowedHeader(testUtils.randString(50), testUtils.randString())).to.be.false
      });
    });
  });
});


describe("standardizeHeaders", function() {
  context("empty object", function() {
    it("returns an empty object", function() {
      const input = {};
      const expectedOutput = {};
      expect(util.standardizeHeaders(input)).to.deep.equal(expectedOutput);
    });
  });

  context("invalid headers are provided", function() {
    it("returns an object with invalid headers removed", function() {
      const input = {
        Zebra: "Hello World",
        CrazyHeader: 1
      };

      const expectedOutput = {};

      expect(util.standardizeHeaders(input)).to.deep.equal(expectedOutput);
    });
  });

  context("valid out of order headers are provided", function() {
    it("returns an ordered headers object with valid headers", function() {
      const input = {
        "OrIGiN": "http://example.com",
        "authorization": "Bearer: 1234",
        "ACCESS-CONTROL-REQUEST-METHOD": "GET, POST",
        "ACCESS-CONTROL-REQUEST-HEADERS": "Test X",
        "aCCept": "Pizza"
      };

      const expectedOutput = {
        "accept": "Pizza",
        "access-control-request-headers": "Test X",
        "access-control-request-method": "GET, POST",
        "authorization": "Bearer: 1234",
        "origin": "http://example.com",
      };

      expect(util.standardizeHeaders(input)).to.deep.equal(expectedOutput);
    });
  });
});


describe("filterQueryParameters", function() {
  context("empty ignored list", function() {
    it("should return all input query parameters", function() {
      const exampleQueryString = "/api/path?abc=1&def=hello&ghi=abc123";
      const request = { path: exampleQueryString };
      const options = withDefaults();
      expect(util.filterQueryParameters(request, options)).to.equal(exampleQueryString);
    });
  });

  context("some ignored parameters", function() {
    it("should return some query parameters", function() {
      const exampleQueryString = "/api/path?abc=1&def=hello&ghi=abc123";
      const expectedQueryString = "/api/path?def=hello";
      const request = { path: exampleQueryString };
      const options = withDefaults({ queryParametersIgnored: ["abc", "ghi"] });
      expect(util.filterQueryParameters(request, options)).to.equal(expectedQueryString);
    });
  });

  context("all ignored parameters", function() {
    it("should return no query parameters", function() {
      const exampleQueryString = "/api/path?abc=1&def=hello&ghi=abc123";
      const expectedQueryString = "/api/path";
      const request = { path: exampleQueryString };
      const options = withDefaults({ queryParametersIgnored: ["abc", "def", "ghi"] });
      expect(util.filterQueryParameters(request, options)).to.equal(expectedQueryString);
    });
  });
});

describe("removeHeaders", function() {
  context("with an empty list", function() {
    it("shoudl return all input headers", function() {
      const response = {
        headers: {
          test: "123",
          accept: "everything"
        }
      };
      const options = withDefaults({ responseHeadersIgnored: [] });

      const expectedHeaders = { test: "123", accept: "everything" };
      expect(util.removeHeaders(response, options)).to.deep.equal(expectedHeaders);
    });
  });

  context("with some ignored headers list", function() {
    it("shoudl return all input headers", function() {
      const response = {
        headers: {
          test: "123",
          accept: "everything",
          test2: "1234", 
          authorization: "Bearer: Pop Secret"
        }
      };
      const options = withDefaults({ responseHeadersIgnored: ["authorization", "test2"] });

      const expectedHeaders = { test: "123", accept: "everything" };
      expect(util.removeHeaders(response, options)).to.deep.equal(expectedHeaders);
    });
  });
});


describe("attachCORSHeaders", function() {
  context("when invoked without an origin", function() {
    it("should attach CORS headers", function() {
      const response = { headers: {} };
      const actual = util.attachCORSHeaders(response);
      expect(actual).to.deep.equal({
        headers: {
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Headers': 'X-Requested-With,Content-Type,Accept,Origin,Authorization',
          'Access-Control-Allow-Methods': 'HEAD,OPTIONS,GET,PUT,POST,DELETE',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Max-Age': '1800'
        }
      });
    });
  });

  context("when invoked with an origin", function() {
    it("should attach CORS headers", function() {
      const response = { headers: {} };
      const actual = util.attachCORSHeaders(response, "http://example.com");
      expect(actual).to.deep.equal({
        headers: {
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Headers': 'X-Requested-With,Content-Type,Accept,Origin,Authorization',
          'Access-Control-Allow-Methods': 'HEAD,OPTIONS,GET,PUT,POST,DELETE',
          'Access-Control-Allow-Origin': 'http://example.com',
          'Access-Control-Max-Age': '1800'
        }
      });
    });
  });
});
