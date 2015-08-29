import {expect} from "chai";
import {validateArguments} from "../src/validation";
import sinon from "sinon";

describe("validation", () => {
  describe("validateArguments", () =>  {
    it("is a function", () => {
      expect(validateArguments).to.be.a("function");
    });
  });
});
