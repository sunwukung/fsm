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

const complexStateGraph = {
  initial: "foo",
  states: {
    foo: "baz",
    bar: ["foo", "baz"],
    baz: {
      foo: (predicateResult) => {
        return predicateResult;
      },
      bar: () => {
        return "not a string";
      },
      bang: true
    },
    bang: "foo",
  },
};

describe("methods", () => {

  let machine = {};

  describe("transition", () => {

    beforeEach(() => {
      machine = fsm(simpleStateGraph);
    });


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

    it("leaves the machine in it's original state", () => {
      machine.transition("baz");
      expect(machine.getState()).to.equal("foo");
    });

  });

  describe("simple state handlers", () =>  {

    beforeEach(() => {
      machine = fsm(complexStateGraph);
    });

    it("strings", () => {
      machine.transition("baz");
      expect(machine.getState()).to.equal("baz");
    });

    it("arrays", () => {
      machine.transition("bar");
      machine.transition("foo");
      expect(machine.getState()).to.equal("foo");
    });
  });

  describe("object state handlers can contain two property types", () =>  {
    let spy;

    beforeEach(() => {
      spy = sinon.spy(complexStateGraph.states.baz, "foo");
      machine = fsm(complexStateGraph);
    });

    afterEach(() => {
      spy.restore();
    });

    it("boolean", () =>  {
      machine.transition("baz");
      machine.transition("bang");
      expect(machine.getState()).to.equal("bang");
    });

    describe("functions (predicates)", () =>  {

      it("passes arguments to the predicate", () => {
        machine.transition("baz");
        machine.transition("foo", true, "additional arguments", 123);
        expect(spy.calledWith(true, "additional arguments", 123)).to.equal(true);
        expect(machine.getState()).to.equal("foo");
      });

      it("performs transition based on boolean result of predicate", () =>  {
        machine.transition("baz");
        machine.transition("foo", false);
        expect(machine.getState()).to.equal("baz");
      });

      it("ignores the result if it is not a boolean", () =>  {
        // this test will be more interesting if we can trigger the
        // error reporter from here
        machine.transition("baz");
        machine.transition("bar");
        expect(machine.getState()).to.equal("baz");
      });

    });

  });

});

