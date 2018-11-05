const test = require("tape");
const sinon = require("sinon");
const { FSM, factory } = require("../src/fsm.js");

const stateGraph = {
  states: {
    foo: "bar",
    bar: ["foo", "baz"],
    baz: "foo"
  },
  actions: {
    cycle: [
      { from: "foo", to: "bar" },
      { from: "bar", to: "baz" },
      { from: "baz", to: "foo" }
    ],
    dynamic: [
      { from: "foo", to: "bar" },
      {
        from: "bar",
        to: ctx => {
          console.log("calling", ctx);
          return ctx === 1 ? "foo" : "baz";
        }
      },
      { from: "baz", to: "foo" }
    ]
  }
};

test("fsm factory returns an instance of FSM", t => {
  const machine = factory({});
  t.ok(machine instanceof FSM);
  t.end();
});

test("fsm.getState returns the current state", t => {
  const machine = factory({}, "foo");
  t.equal(machine.getState(), "foo");
  t.end();
});

test("fsm.transition will transition from one state to the next", t => {
  const machine = factory(stateGraph, "foo");
  machine.transition("bar");
  t.equal(machine.getState(), "bar");
  machine.transition("baz");
  t.equal(machine.getState(), "baz");
  machine.transition("foo");
  t.equal(machine.getState(), "foo");
  t.end();
});

test("fsm.transition will not complete if the target state is not available", t => {
  const machine = factory(stateGraph, "foo");
  machine.transition("cobblers");
  t.equal(machine.getState(), "foo");
  t.end();
});

test("can subscribe to change events", t => {
  const machine = factory(stateGraph, "foo");
  const spy = sinon.spy();
  machine.onChange(spy);
  machine.transition("bar");
  t.ok(spy.calledOnce);
  t.end();
});

test("change subscribers are given previous and current state", t => {
  const machine = factory(stateGraph, "foo");
  const spy = sinon.spy();
  machine.onChange(spy);
  machine.transition("bar");
  t.ok(spy.calledWith({ previous: "foo", current: "bar" }));
  t.end();
});

test("can subscribe to error events", t => {
  const machine = factory(stateGraph, "foo");
  const spy = sinon.spy();
  machine.onError(spy);
  machine.transition("quack");
  t.ok(spy.calledOnce);
  t.end();
});

test("error subscribers are given current and target state", t => {
  const machine = factory(stateGraph, "foo");
  const spy = sinon.spy();
  machine.onError(spy);
  machine.transition("quack");
  t.ok(spy.calledWith({ current: "foo", target: "quack" }));
  t.end();
});

test("removeChangeSubscription removes change handlers", t => {
  const machine = factory(stateGraph, "foo");
  const spy = sinon.spy();
  machine.onChange(spy);
  machine.transition("bar");
  t.ok(spy.calledOnce);
  machine.removeChangeSubscription(spy);
  machine.transition("baz");
  t.ok(spy.calledOnce);
  t.end();
});

test("removeErrorSubscription removes error handlers", t => {
  const machine = factory(stateGraph, "foo");
  const spy = sinon.spy();
  machine.onError(spy);
  machine.transition("quack");
  t.ok(spy.calledOnce);
  machine.removeErrorSubscription(spy);
  machine.transition("quack");
  t.ok(spy.calledOnce);
  t.end();
});

test("machine can transition through linear states", t => {
  const machine = factory(stateGraph, "foo");
  machine.action("cycle");
  t.equal(machine.getState(), "bar");
  machine.action("cycle");
  t.equal(machine.getState(), "baz");
  machine.action("cycle");
  t.equal(machine.getState(), "foo");
  t.end();
});

test("machine can transition through dynamic states", t => {
  const machine = factory(stateGraph, "bar");
  machine.action("dynamic", 1);
  t.equal(machine.getState(), "foo");
  machine.action("cycle");
  machine.action("dynamic", 0);
  t.equal(machine.getState(), "baz");
  t.end();
});
