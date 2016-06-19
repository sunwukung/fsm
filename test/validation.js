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
    const badActionSpecs = [null, true, "string", [], () => {}];
    badActionSpecs.forEach((badActionSpec) => {
      expect(() => {
        validateActions(badActionSpec, complexStateGraph.states);
      }).to.throw("'actions' should be an object (if defined)");
    });
  });

  it("throws if the properties defined in the actions object are not arrays", () =>  {
    const badActions = [null, true, "string", {}, () => {}];
    badActions.forEach((badArg) => {
      expect(() => {
        validateActions({foo: badArg}, complexStateGraph.states);
      }).to.throw("'actions' should contain arrays");
    });
  });

  it("throws if the actions arrays do not contain objects", () =>  {
    const badTransitions = [null, undefined, true, 1, "foo", [], () => {}];
    badTransitions.forEach((badTransition) => {
      expect(() => {
        validateActions({foo: [badTransition]}, complexStateGraph.states);
      }).to.throw("transitions defined in actions should be an object");
    });
  });

  it("throws if the transition objects do not contain a 'from' property", () =>  {
    expect(() => {
      validateActions({foo: [
        {notFrom: "no from property in this object"}
      ]}, complexStateGraph.states);
    }).to.throw("transitions defined in actions should contain a 'from' property");
  });

  it("throws if the from property is not a string or an array", () =>  {
    const badTransitions = [
      null, true, 123, {}, () => {}
    ];
    badTransitions.forEach((badTransition) => {
      expect(() => {
        validateActions(
          {foo: [{from: badTransition}]},
          complexStateGraph.states
        );
      }).to.throw("from properties should be a string or an array");
    });
  });

  it("throws if the transition objects do not contain a 'to' property", () =>  {
    expect(() => {
      validateActions(
        {foo: [{from: "bar", notTo: "no to property in objects"}]},
        complexStateGraph.states
      );
    }).to.throw("transitions defined in actions should contain a 'to' property");
  });

  it("throws if the to property is not a string", () =>  {
    const badToProperties = [null, true, 1, [], {}, () => {}];
    badToProperties.forEach((badProperty) => {
      expect(() => {
        validateActions(
          {foo: [{from: "foo", to: badProperty}]},
          complexStateGraph.states
        );
      }).to.throw("to properties should be a string");
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
