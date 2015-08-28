import {validateConstruction, validateSubscription, isString, isFunction} from "./lib.js";

function compileSubscriptionKeys(stateGraph) {
  let subscriptionKeys = {
    enter: {},
    exit: {}
  };

  Object.keys(stateGraph).forEach((key) => {
    subscriptionKeys.enter[key] = [];
    subscriptionKeys.exit[key] = [];
  });

  return subscriptionKeys;

}

export default function(stateGraph, initialState) {

  validateConstruction(stateGraph, initialState);
  const subscriptions = compileSubscriptionKeys(stateGraph);
  let currentState = initialState;

  const fsm = {

    canTransition(targetState, args) {
      const stateHandler = stateGraph[currentState];
      if (isString(stateHandler)) {
        return stateHandler === targetState;
      }
      if (isFunction(stateHandler)) {
        return stateHandler.apply(stateGraph, args) === targetState;
      }
      return false;
    },

    transition(targetState, ...args) {
      const stateHandler = stateGraph[currentState];
      if (fsm.canTransition(targetState, args)) {
        if (isFunction(stateHandler)) {
          currentState = stateHandler.apply(stateHandler, args);
        } else {
          currentState = targetState;
        }

        subscriptions.enter[currentState].forEach((subscriber) => {
          subscriber();
        });
      }
    },

    onEnter(state, callback) {
      validateSubscription(state, callback, stateGraph);
      subscriptions.enter[state].push(callback);
    },

    getState() {
      return currentState;
    }

  };

  return fsm;
}
