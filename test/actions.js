import {expect} from "chai";
import fsm from "../src/fsm";
import sinon from "sinon";

const simpleStateGraph = {
  states: {
    foo: "bar",
    bar: "baz",
    baz: "foo"
  },
  actions: {
    next: {from: "foo", to: "bar"}
  },
  initial: "foo"
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
  });

});

