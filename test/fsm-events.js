import {expect} from "chai";
import fsm from "../src/fsm";
import sinon from "sinon";

const INVALID_CALLBACK_ERROR = "Invalid callback supplied";

const simpleStateGraph = {
  states: {
    foo: ["bar", "terminal"],
    bar: "baz",
    baz: "foo",
    terminal: "terminal",
  },
  initial: "foo" // ? should possibly allow terminal states to be specified by name
};

describe("event hooks", () => {

  let machine = {};

  beforeEach(() => {
    machine = fsm(simpleStateGraph, "foo");
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
        }).to.throw(INVALID_CALLBACK_ERROR);
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

  describe("onTerminate", () =>  {
    it("is a function", () =>  {
      expect(machine.onTerminate).to.be.a("function");
    });
    it("will throw if the callback is not a function", () =>  {
      [null, false, undefined, 123, [], {}].forEach((badArg) => {
        expect(() => {
          machine.onTerminate(badArg);
        }).to.throw(INVALID_CALLBACK_ERROR);
      });
    });
    it("will invoke the callback if the machine enters a terminal state", () =>  {
      const spy = sinon.spy();
      machine.onTerminate(spy);
      machine.transition("terminal");
      expect(spy.called).to.equal(true);
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
        }).to.throw(INVALID_CALLBACK_ERROR);
      });
    });

    it("will invoke the callback if the machine fails to transition", () => {
      const spy = sinon.spy();
      machine.onFail(spy);
      machine.transition("baz");
      expect(spy.called).to.equal(true);
    });

    it("will not invoke onFail if the machine is already in a terminal state", () =>  {
      const spy = sinon.spy();
      machine.onFail(spy);
      machine.transition("terminal");
      machine.transition("terminal");
      expect(spy.called).to.equal(false);
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
