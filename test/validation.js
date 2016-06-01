import {expect} from "chai";
import {
  collectTargetStates,
  isValidStateGraph,
  validateActions,
  collectActionKeys
} from "../src/validation";

const complexStateGraph = {
  states: {
    foo: "baz",
    bar: ["foo", "baz"],
    baz: {
      foo: () => true
    }
  },
  initial: "foo",
  actions: {
    next: [
      {from: "foo", to: "bar"},
    ]
  }
};


describe("collectTargetStates", () =>  {

  it("is a function", () =>  {
    expect(collectTargetStates).to.be.a.function;
  });

  it("returns an array", () =>  {
    expect(collectTargetStates({})).to.be.a.array;
  });

  it("contains the target states described in the graph", () =>  {
    const stateGraph = {
      foo: "baz",
      bar: ["foo", "baz"],
      baz: {
        foo: true,
        bar: true,
        bang: false // doesn't exist
      }
    };
    const targetStates = collectTargetStates(stateGraph);
    expect(collectTargetStates(stateGraph)).to.eql([
      "bang",
      "bar",
      "baz",
      "foo",
    ]);
  });
});

describe("isValidStateGraph", () =>  {

  it("is a function", () =>  {
    expect(isValidStateGraph).to.be.a.function;
  });

  it("rejects state graphs with less than two keys", () =>  {
    expect(() => {
      isValidStateGraph({one: "not valid"});
    }).to.throw("there is only one state in the state graph");
  });

  it("rejects state graphs with unreachable states", () => {
    expect(() => {
      isValidStateGraph({
        one: "three",
        two: "one",
        three: "one"
      });
    }).to.throw("these states are unreachable: two");
  });

  it("rejects state graphs with invalid target states", () =>  {
    expect(() => {
      isValidStateGraph({
        one: "two",
        two: ["one", "three"],
        three: "four"
      });
    }).to.throw("these target states do not exist in the graph: four");
  });

});

describe("validateActions", () =>  {
  it("is a function", () =>  {
    expect(validateActions).to.be.a.function;
  });
  it("throws if 'actions' are not an object", () =>  {
    const badActions = [null, true, "string", [], () => {}];
    badActions.forEach((badAction) => {
      expect(() => {
        validateActions(badAction, complexStateGraph.states);
      }).to.throw("'actions' should be an object (if defined)");
    });
  });
});

describe("collectActionKeys", () =>  {
  it("is a function", () =>  {
    expect(collectActionKeys).to.be.a.function;
  });
  it("returns an array", () => {
    expect(collectActionKeys(complexStateGraph.actions)).to.be.an.array;
  });
});
