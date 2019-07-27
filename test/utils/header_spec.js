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
    it(`it returns false for ${Headers.CONTENT_TYPE}`, function() {
      expect(util.isAllowedHeader(Headers.CONTENT_TYPE, testUtils.randString())).to.be.false
    });

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
    it("returns an empty headers object", function() {
      const input = {
        Zebra: "Hello World",
        CrazyHeader: 1
      };

      const expectedOutput = {};

      expect(util.standardizeHeaders(input)).to.deep.equal(expectedOutput);
    });
  });

  context("valid out of order headers are provided", function() {
    it("returns an ordered headers object", function() {
      const input = {
        ORIGIN: "http://example.com",
        AUTHORIZATION: "Bearer: 1234",
        "ACCESS-CONTROL-REQUEST-METHOD": "GET, POST",
        "ACCESS-CONTROL-REQUEST-HEADERS": "Test X",
        ACCEPT: "Pizza"
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


