import {expect} from "chai";
import fsm from "../src/fsm";
import sinon from "sinon";
import {merge} from "ramda";
const sandbox = sinon.sandbox.create();
// first, assume arrays by default
// then allow for single objects?
const dynamicStub = sandbox.stub();
const pluralStub = sandbox.stub();

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
      {from: "baz", to: dynamicStub}
    ],
    pluralDynamic: [
      {from: ["foo", "tom"], to: pluralStub}
    ],
    dynamicInvalid: [
      {from: "foo", to: () => "invalid"}
    ]
  }
};

dynamicStub.withArgs("baz", 1).returns("tom");
pluralStub.withArgs("tom").returns("foo");

describe("actions", () => {

  let machine = {};

  beforeEach(() => {
    sandbox.reset();
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

    it("will attempt to transition using an array:string mapping", () =>  {
      machine.transition("bar");
      expect(machine.getState()).to.equal("bar");
      machine.transition("baz");
      expect(machine.getState()).to.equal("baz");
      machine.transition("tom");
      expect(machine.getState()).to.equal("tom");
      machine.trigger("plural");
      expect(machine.getState()).to.equal("foo");
    });

    it("will attempt to transition using a string:function mapping", () =>  {
      machine.transition("bar");
      expect(machine.getState()).to.equal("bar");
      machine.transition("baz");
      expect(machine.getState()).to.equal("baz");
      machine.trigger("dynamic", 1);
      expect(machine.getState()).to.equal("tom");
      expect(dynamicStub.calledWithMatch("baz", 1)).to.equal(true);
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
      expect(pluralStub.calledWith("tom")).to.equal(true);
    });

    it("will report an error if the action returns an invalid state", () =>  {
      expect(() => {
        machine.trigger("dynamicInvalid");
      }).to.throw("state key could not be found in the state graph");
    });

    it("will return an error if the from properties in an array are not strings", () =>  {
      const stateGraph = {
        initial: "foo",
        states: {
          foo: "bar",
          bar: "baz",
          baz: "foo",
        },
        actions: {
          invalid: [
            {from: [123], to: "bar"}
          ]
        }
      };
      expect(() => {
        const machine = fsm(stateGraph);
      }).to.throw("elements in from arrays must be strings");
    });

  });

});

