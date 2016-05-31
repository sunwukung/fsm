export default {
  initial: "foo",
  states: {
    /*
     a single string assigned to the handler indicates that there is
     only one exit state, and it can always be transitioned to
     */
    foo: "bar",
    /*
     an array indicates that there are multiple exit states, and they
     can always be transitioned to
     */
    bar: ["foo", "bar"],
    /*
     an object indicates that there are potentially many exit
     states. some of them may require some precondition to be
     satisfied before the transition is allowed
     */
    baz: {
      foo: (a) => { return a === 1; }, // must satisfy the predicate
      bar: true // can always be transitioned to
    },
  },
};
