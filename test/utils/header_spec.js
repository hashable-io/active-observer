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


