import {validateConstruction, validateSubscription, isString, isFunction} from "./lib.js";

function compileSubscriptionKeys(stateGraph) {
  let subscriptionKeys = {
    enter: {},
    exit: {},
    fail: [],
    change: []
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
      const stateAtTimeOfTransition = currentState;

      if (fsm.canTransition(targetState, args)) {
        if (isFunction(stateHandler)) {
          currentState = stateHandler.apply(stateHandler, args);
        } else {
          currentState = targetState;
        }
      }

      if (stateAtTimeOfTransition !== currentState) {

        subscriptions.exit[currentState].forEach((subscriber) => {
          subscriber(stateAtTimeOfTransition, currentState, args);
        });
        subscriptions.enter[currentState].forEach((subscriber) => {
          subscriber(stateAtTimeOfTransition, currentState, args);
        });
        subscriptions.change.forEach((subscriber) => {
          subscriber(stateAtTimeOfTransition, currentState, args);
        });
      } else {
        subscriptions.fail.forEach((subscriber) => {
          subscriber(stateAtTimeOfTransition, args);
        });
      }

    },

    onEnter(state, callback) {
      validateSubscription(state, callback, stateGraph);
      subscriptions.enter[state].push(callback);
    },

    onExit(state, callback) {
      validateSubscription(state, callback, stateGraph);
      subscriptions.exit[state].push(callback);
    },

    onChange(callback) {
      if(!isFunction(callback)) {
        throw new Error("invalid callback supplied");
      }
      subscriptions.change.push(callback);
    },

    onFail(callback) {
      if(!isFunction(callback)) {
        throw new Error("invalid callback supplied");
      }
      subscriptions.fail.push(callback);
    },

    getState() {
      return currentState;
    }

  };

  return fsm;
}
