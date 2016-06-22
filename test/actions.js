import {expect} from "chai";
import fsm from "../src/fsm";
import sinon from "sinon";
import {merge} from "ramda";
const sandbox = sinon.sandbox.create()
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
    dynamic: [
      {from: "baz", to: (currentState, val) => {
        return val === 1 ? "tom" : "dick";
      }}
    ],
    pluralDynamic: [
      {from: ["foo", "tom"], to: (currentState) => {return currentState === "tom" ? "foo" : "bar";}}
    ]
  }
};

describe.only("actions", () => {

  let machine = {};
  let singleSpyA = sandbox.spy(simpleStateGraph, actions.single[0].to);
  let singleSpyB = sandbox.spy(simpleStateGraph, actions.single[1].to);
  let singleSpyB = sandbox.spy(simpleStateGraph, actions.single[2].to);
  let pluralSpy = sandbox.spy(simpleStateGraph, actions.plural[0].to);
  let dynamicSpy = sandbox.spy(simpleStateGraph, actions.dynamic[0].to);
  let pluralDynamicSpy = sandbox.spy(simpleStateGraph, actions.pluralDynamic[0].to);

  beforeEach(() => {
    machine = fsm(simpleStateGraph);
  });
  afterEach(() => {
    sandbox.reset();
  })

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

    it("will attempt to transition using an array:string mapping", () =>  {
      machine.transition("bar");
      expect(machine.getState()).to.equal("bar");
      machine.transition("baz");
      expect(machine.getState()).to.equal("baz");
      machine.transition("tom");
      expect(machine.getState()).to.equal("tom");
      machine.trigger("plural");
      expect(machine.getState()).to.equal("foo")
    });

    it("will attempt to transition using a string:function mapping", () =>  {
      machine.transition("bar");
      expect(machine.getState()).to.equal("bar");
      machine.transition("baz");
      expect(machine.getState()).to.equal("baz");
      machine.trigger("dynamic", 1);
      expect(machine.getState()).to.equal("tom")
    });

    it("will attempt to transition using an array:function mapping", () =>  {
      machine.transition("bar");
      expect(machine.getState()).to.equal("bar");
      machine.transition("baz");
      expect(machine.getState()).to.equal("baz");
      machine.transition("tom");
      expect(machine.getState()).to.equal("tom");
      machine.trigger("pluralDynamic");
      expect(machine.getState()).to.equal("foo");
    })
  });

});

