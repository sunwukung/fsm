export default {
  initial: "foo",
  states: {
    foo: {
      bar: "bar"
    },
    bar: {
      baz: "baz"
    },
    baz: {
      foo: "foo"
    }
  },
  actions: {
    next: [
      {foo: "bar"},
      {bar: "baz"},
      {baz: "baz"}
    ]
  }
};
