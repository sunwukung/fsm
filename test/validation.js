import {expect} from "chai";
import {validateActions, collectActionKeys} from "../src/validation";

const spec = {
  states: {
    foo: "bar",
    bar: "baz",
    baz: "foo"
  },
  initial: "foo",
  actions: {
    next: [
      {from: "foo", to: "bar"},
    ]
  }
};


describe("validateActions", () =>  {
  it("is a function", () =>  {
    expect(validateActions).to.be.a.function;
  });
  it("throws if 'actions' are not an object", () =>  {
    const badActions = [null, true, "string", [], () => {}];
    badActions.forEach((badAction) => {
      expect(() => {
        validateActions(badAction, spec.states);
      }).to.throw("'actions' should be an object (if defined)");
    });
  });
});


describe("collectActionKeys", () =>  {
  it("is a function", () =>  {
    expect(collectActionKeys).to.be.a.function;
  });
  it("returns an array", () => {
    expect(collectActionKeys(spec.actions)).to.be.an.array;
  });
});
