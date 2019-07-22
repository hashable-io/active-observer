import { expect } from "chai";

import { Either } from "monet";

import { parseJson } from "../../src/utils/json";

describe("parseJson", function() {
  context("with a valid json parameter", function() {
    it("returns a right with json payload", function() {
      const inputJson = {key: "value"}
      const actual = parseJson(JSON.stringify(inputJson));
      const expected = Either.right(inputJson);
  
      expect(actual).to.deep.equal(expected);
    });
  });

  context("with a non-json parameter", function() {
    it("returns a left with the error", function() {
      const inputString = "Just some text data...nothing else.";
      const actual = parseJson(inputString);

      expect(actual.isLeft()).to.be.true;
      expect(actual.left()).to.be.an('error');
    });
  }); 
});
