var expect = require("chai").expect
  , fsm = require("../dist/fsm");

describe("swk-fsm", function () {
  it("is an object", function () {
    expect(fsm).to.be.a("function");
  });
});
