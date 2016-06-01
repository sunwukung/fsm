import {expect} from "chai";
import fsm from "../src/fsm";

describe("swk-fsm", function() {

  const stateGraph = {
    states: {
      foo: {
        bar: (a) => {
          return a === true;
        }
      },
      bar: "baz",
      baz: "foo"
    },
    initial: "foo"
  };

  it("is a function", function() {
    expect(fsm).to.be.a("function");
  });

  it("will throw if the state graph is not an object", () => {
    [null, false, undefined, 123, "a string", [], () => {}].forEach((badArg) => {
      expect(() => {
        const machine = fsm(badArg);
      }).to.throw("state graph is not an object");
    });
  });

  it("will throw if there is no initial state specified in the stateGraph", () => {
    expect(() => {
      fsm({states: {foo: "bar", bar: "foo"}});
    }).to.throw("'initial' was not defined");
  });

  it("will throw if the initial state is not a string", () => {
    const badTypes = [null, false, 123, [], {}, () => {}];
    badTypes.forEach((badType) => {
      expect(() => {
        const machine = fsm({states: {foo: "bar"}, initial: badType});
      }).to.throw("'initial' is not a string");
    });
  });

  it("will throw if the initial state is not available in the state graph", () => {
    expect(() => {
      const machine = fsm({states: {foo: "bar", bar: "foo"}, initial: "baz"});
    }).to.throw("initial state cannot be found in state graph");
  });

  it("will throw if there are less than 2 states in the state graph", () => {
    expect(() => {
      const machine = fsm({states: {foo: "bar"}, initial: "foo"});
    }).to.throw("there is only one state in the state graph");
  });

  it("will return a state machine if the arguments are valid", () => {
    const machine = fsm({states: {foo: "bar", bar: "baz", baz: "baz"}, initial: "foo"});
    expect(machine).to.be.an("object");
  });

});



