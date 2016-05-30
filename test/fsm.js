import {expect} from "chai";
import fsm from "../src/fsm";
import sinon from "sinon";

const simpleStateGraph = {
  initial: "foo",
  states: {
    foo: "bar",
    bar: "baz",
    baz: "foo"
  }
};

const dynamicStateGraph = {
  initial: "foo",
  states: {
    foo: {
      bar: (a) => {
        return a === true;
      }
    },
    bar: "baz",
    baz: "foo"
  }
};

describe("methods", () => {

  let machine = {};

  beforeEach(() => {
    machine = fsm(simpleStateGraph);
  });

  describe("transition", () => {

    it("is a function", () => {
      expect(machine.transition).to.be.a("function");
    });

    it("will throw if the state key is not a string", () => {
      [false, undefined, null, 123, [], {}, () => {}].forEach((badArg) => {
        expect(() => {
          machine.transition(badArg);
        }).to.throw("state key must be a string");
      });
    });

    it("will throw if the state key is not in the state graph", () => {
      expect(() => {
        machine.transition("unknown");
      }).to.throw("state key could not be found in the state graph");
    });

    it("moves the machine from its current state to the specified state", () => {
      machine.transition("bar");
      expect(machine.getState()).to.equal("bar");
    });


    it("passes arguments through to the state handler", () => {
      let spy = sinon.spy(dynamicStateGraph.states.foo, "bar");
      machine = fsm(dynamicStateGraph);
      machine.transition("bar", true, "additional arguments", 123);
      expect(spy.calledWith(true, "additional arguments", 123)).to.equal(true);
      expect(machine.getState()).to.equal("bar");
      spy.restore();
    });

    it("leaves the machine in it's original state if the transition is not possible", () => {
      machine.transition("baz");
      expect(machine.getState()).to.equal("foo");
    });

  });

});

