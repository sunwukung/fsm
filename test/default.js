import {expect} from "chai";
import fsm from "../src/fsm";
import sinon from "sinon";

const simpleStateGraph = {
  foo: "bar",
  bar: "baz",
  baz: "foo"
};

const dynamicStateGraph = {
  foo: {
    bar: (a) => {
      return a === true;
    }
  },
  bar: "baz",
  baz: "foo"
};


describe("methods", () => {

  let machine = {};

  beforeEach(() => {
    machine = fsm(simpleStateGraph, "foo");
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
      let spy = sinon.spy(dynamicStateGraph.foo, "bar");
      machine = fsm(dynamicStateGraph, "foo");
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


  describe("onEnter", () => {

    let machine = {};

    beforeEach(() => {
      machine = fsm(simpleStateGraph, "foo");
    });

    it("is a function", () => {
      expect(machine.onEnter).to.be.a("function");
    });

    it("will throw if the state key is not a string", () => {
      [null, false, undefined, 123, [], {}, () => {}].forEach((badArg) => {
        expect(() => {
          machine.onEnter(badArg, () => {});
        }).to.throw("state key is not a string");
      });
    });

    it("will throw if the state key is not in the state graph", () => {
      expect(() => {
        machine.onEnter("nokey", () => {});
      }).to.throw("no state matches subscription key");
    });

    it("will throw if the callback is not a function", () => {
      [null, false, undefined, 123, "a string", [], {}].forEach((badArg) => {
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

    it("will invoke the callback with the arguments passed to transition", () => {
      const spy = sinon.spy();
      machine.onEnter("bar", spy);
      machine.transition("bar", 1, 2, 3);
      expect(spy.calledWith("foo", "bar", [1, 2, 3])).to.equal(true);
    });
  });

  describe("offEnter", () =>  {
    it("is a function", () => {
      expect(machine.offEnter).to.be.a("function");
    });
    it("will remove a previously registered subscriber", () => {
      const spy = sinon.spy();
      machine.onEnter("bar", spy);
      machine.transition("bar");
      expect(spy.called).to.equal(true);
      spy.reset();
      machine.offEnter("bar", spy);
      machine.transition("baz");
      machine.transition("foo");
      machine.transition("bar");
      expect(spy.called).to.equal(false);
    });
  });


  describe("onExit", () => {

    let machine = {};

    beforeEach(() => {
      machine = fsm(simpleStateGraph, "foo");
    });

    it("is a function", () => {
      expect(machine.onExit).to.be.a("function");
    });

    it("will throw if the state key is not a string", () => {
      [null, false, undefined, 123, [], {}, () => {}].forEach((badArg) => {
        expect(() => {
          machine.onExit(badArg, () => {});
        }).to.throw("state key is not a string");
      });
    });

    it("will throw if the state key is not in the state graph", () => {
      expect(() => {
        machine.onExit("nokey", () => {});
      }).to.throw("no state matches subscription key");
    });

    it("will throw if the callback is not a function", () => {
      [null, false, undefined, 123, "a string", [], {}].forEach((badArg) => {
        expect(() =>  {
          machine.onExit("foo", badArg);
        }).to.throw("callback is not a function");
      });
    });

    it("will invoke the callback if the state is exited", () => {
      const spy = sinon.spy();
      machine.onExit("foo", spy);
      machine.transition("bar");
      expect(spy.called).to.equal(true);
    });

    it("will invoke the callback with the arguments passed to transition", () => {
      const spy = sinon.spy();
      machine.onExit("foo", spy);
      machine.transition("bar", 1, 2, 3);
      expect(spy.calledWith("foo", "bar", [1, 2, 3])).to.equal(true);
    });
  });

  describe("offExit", () =>  {
    it("is a function", () => {
      expect(machine.offExit).to.be.a("function");
    });
    it("will remove a previously registered subscriber", () => {
      const spy = sinon.spy();
      machine.onExit("foo", spy);
      machine.transition("bar");
      expect(spy.called).to.equal(true);
      spy.reset();
      machine.offExit("foo", spy);
      machine.transition("baz");
      machine.transition("foo");
      machine.transition("bar");
      expect(spy.called).to.equal(false);
    });
  });

  describe("onChange", () =>  {

    it("is a function", () => {
      expect(machine.onChange).to.be.a("function");
    });

    it("will throw if the callback is not a function", () => {
      [null, false, undefined, 123, [], {}].forEach((badArg) => {
        expect(() => {
          machine.onChange(badArg);
        }).to.throw("invalid callback supplied");
      });
    });

    it("will invoke the callback if the machine state changes", () => {
      const spy = sinon.spy();
      machine.onChange(spy);
      machine.transition("bar");
      expect(spy.called).to.equal(true);
    });

    it("will invoke the callback with the arguments passed to transition", () => {
      const spy = sinon.spy();
      machine.onChange(spy);
      machine.transition("bar", 1, 2, 3);
      expect(spy.calledWith("foo", "bar", [1, 2, 3])).to.equal(true);
    });

  });

  describe("offChange", () =>  {
    it("is a function", () => {
      expect(machine.offChange).to.be.a("function");
    });

    it("will remove a previously registered subscriber", () => {
      const spy = sinon.spy();
      machine.onChange(spy);
      machine.transition("bar");
      expect(spy.called).to.equal(true);
      spy.reset();
      machine.offChange(spy);
      machine.transition("baz");
      expect(spy.called).to.equal(false);
    });

  });

  describe("onFail", () =>  {

    it("is a function", () => {
      expect(machine.onFail).to.be.a("function");
    });

    it("will throw if the callback is not a function", () => {
      [null, false, undefined, 123, [], {}].forEach((badArg) => {
        expect(() => {
          machine.onFail(badArg);
        }).to.throw("invalid callback supplied");
      });
    });

    it("will invoke the callback if the machine fails to transition", () => {
      const spy = sinon.spy();
      machine.onFail(spy);
      machine.transition("baz");
      expect(spy.called).to.equal(true);
    });
  });


  describe("offFail", () =>  {
    it("is a function", () => {
      expect(machine.offFail).to.be.a("function");
    });

    it("will remove a previously registered subscriber", () => {
      const spy = sinon.spy();
      machine.onFail(spy);
      machine.transition("foo");
      expect(spy.called).to.equal(true);
      spy.reset();
      machine.offFail(spy);
      machine.transition("foo");
      expect(spy.called).to.equal(false);
    });

  });


});


describe("swk-fsm", function() {

  it("is a function", function() {
    expect(fsm).to.be.a("function");
  });

  it("will throw if the state graph is not an object", () => {
    [null, false, undefined, 123, "a string", [], () => {}].forEach((badArg) => {
      expect(() => {
        const machine = fsm(badArg, "UNINITIALIZED");
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



