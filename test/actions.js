import {expect} from "chai";
import fsm from "../src/fsm";
import sinon from "sinon";
import {merge} from "ramda";

// first, assume arrays by default
// then allow for single objects?

const simpleStateGraph = {
  initial: "foo",
  states: {
    foo: "bar",
    bar: "baz",
    baz: ["foo", "tom", "dick", "harry"],
    tom: "foo",
    dick: "foo",
    harry: "foo"
  },
  actions: {
    single: [
      {from: "foo", to: "bar"},
      {from: "bar", to: "baz"},
      {from: "baz", to: "foo"},
    ],
    plural: [
      {from: ["tom", "dick", "harry"], to: "foo"},
    ],
    predicate: [
      {from: "fighting", to: (state) => {return state === "win" ? "victory" : "defeat";}}
    ]
  }
};

describe("actions", () => {

  let machine = {};

  beforeEach(() => {
    machine = fsm(simpleStateGraph);
  });

  describe("trigger", () => {

    it("is a function", () => {
      expect(machine.trigger).to.be.a("function");
    });

    it("will throw if the first argument is not a string", () => {
      [null, false, undefined, 123, [], {}, () => {}].forEach((badType) => {
        expect(() => {
          machine.trigger(badType);
        }).to.throw("trigger requires string as first argument");
      });
    });

    it("will attempt to transition the machine using a simple string:string mapping", () =>  {
      expect(machine.getState()).to.equal("foo");
      machine.trigger("single");
      expect(machine.getState()).to.equal("bar");
      machine.trigger("single");
      expect(machine.getState()).to.equal("baz");
    });
  });

});

