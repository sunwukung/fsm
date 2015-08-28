import {expect} from "chai";
import fsm from "../src/fsm";
import sinon from "sinon";

describe("swk-fsm", function() {

  it("is a function", function() {
    expect(fsm).to.be.a("function");
  });

  it("will throw if the state graph is not an object", () => {
    const badTypes = [null, false, undefined, 123, "a string", [], () => {}];
    badTypes.forEach((badStateGraph) => {
      expect(() => {
        const machine = fsm(badStateGraph, "UNINITIALIZED");
      }).to.throw("state graph is not an object");
    });
  });

  it("will throw if the initial state is not a string", () => {
    const badTypes = [null, false, undefined, 123, [], {}, () => {}];
    badTypes.forEach((badType) => {
      expect(() => {
        const machine = fsm({foo: "bar"}, badType);
      }).to.throw("initial state is not a string");
    });
  });

  it("will throw if the initial state is not available in the state graph", () => {
    expect(() => {
      const machine = fsm({foo: "bar", bar: "baz"}, "baz");
    }).to.throw("initial state cannot be found in state graph");
  });

  it("will throw if there are less than 2 states in the state graph", () => {
    expect(() => {
      const machine = fsm({foo: "bar"}, "foo");
    }).to.throw("state graph is invalid");
  });

  it("will return a state machine if the arguments are valid", () => {
    const machine = fsm({foo: "bar", bar: "baz"}, "foo");
    expect(machine).to.be.an("object");
  });

});


describe("methods", () => {

  let machine = {};

  const simpleStateGraph = {
    foo: "bar",
    bar: "baz",
    baz: "foo"
  };

  const dynamicStateGraph = {
    foo: (a) => {
      return (a === true) ? "baz" : "bar";
    },
    bar: "baz",
    baz: "foo"
  };

  beforeEach(() => {
    machine = fsm(simpleStateGraph, "foo");
  });

  describe("transition", () => {

    it("is a function", () => {
      expect(machine.transition).to.be.a("function");
    });

    it("moves the machine from its current state to the specified state", () => {
      machine.transition("bar");
      expect(machine.getState()).to.equal("bar");
    });

    it("leaves the machine in it's original state if the transition is not possible", () => {
      machine.transition("baz");
      expect(machine.getState()).to.equal("foo");
    });

    it("passes arguments through to the state handler", () => {
      machine = fsm(dynamicStateGraph, "foo");
      machine.transition("baz", true);
      expect(machine.getState()).to.equal("baz");
    });

  });

  describe("onEnter", () => {

    let machine = {};

    beforeEach(() => {
      machine = fsm(simpleStateGraph, "foo");
    });

    it("is a function", () => {
      expect(machine.onEnter).to.be.a("function");
    });

    it("will throw if the state key is not a string", () => {
      const badArgs = [null, false, undefined, 123, [], {}, () => {}];
      badArgs.forEach((badArg) => {
        expect(() => {
          machine.onEnter(badArg, () => {});
        }).to.throw("state key is not a string");
      });
    });

    it("will throw if the state key does not match a key in the state graph", () => {
      expect(() => {
        machine.onEnter("nokey", () => {});
      }).to.throw("no state matches subscription key");
    });

    it("will throw if the callback is not a function", () => {
      const badArgs = [null, false, undefined, 123, "a string", [], {}];
      badArgs.forEach((badArg) => {
        expect(() =>  {
          machine.onEnter("foo", badArg);
        }).to.throw("callback is not a function");
      });
    });

    it("will invoke the callback if the state is entered", () => {
      const spy = sinon.spy();
      machine.onEnter("bar", spy);
      machine.transition("bar");
      expect(spy.called).to.equal(true);
    });
  });

});


