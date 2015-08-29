import {validateTargetState, validateConstruction, validateSubscription, isString, isFunction, isObject} from "./validation.js";
import {contains, filter} from "./fn.js";

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

function handleTransition(targetState, currentState, stateHandler, stateGraph, args) {

  if (isString(stateHandler) && (stateHandler === targetState)) {
    currentState = targetState;
  } else {
    if (isObject(stateHandler) && isFunction(stateHandler[targetState])) {
      if (stateHandler[targetState].apply(stateGraph, args)) {
        currentState = targetState;
      }
    }
  }
  return currentState;
};

export default function(stateGraph, initialState) {

  validateConstruction(stateGraph, initialState);
  const subscriptions = compileSubscriptionKeys(stateGraph);
  let currentState = initialState;
  const stateKeys = Object.keys(stateGraph);

  const fsm = {


    transition(targetState, ...args) {
      const stateHandler = stateGraph[currentState];
      const stateAtTimeOfTransition = currentState;

      validateTargetState(targetState, stateKeys);

      currentState = handleTransition(targetState, currentState, stateHandler, stateGraph, args);

      if (stateAtTimeOfTransition !== currentState) {
        subscriptions.exit[stateAtTimeOfTransition].forEach((subscriber) => {
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

    offEnter(state, callback) {
      subscriptions.enter[state] = filter((subscriber) => {
        return subscriber !== callback;
      }, subscriptions.enter[state]);
    },

    onExit(state, callback) {
      validateSubscription(state, callback, stateGraph);
      subscriptions.exit[state].push(callback);
    },

    offExit(state, callback) {
      subscriptions.exit[state] = filter((subscriber) => {
        return subscriber !== callback;
      }, subscriptions.exit[state]);
    },

    onChange(callback) {
      if(!isFunction(callback)) {
        throw new Error("invalid callback supplied");
      }
      subscriptions.change.push(callback);
    },

    offChange(callback) {
      subscriptions.change = filter((subscriber) => {
        return subscriber !== callback;
      }, subscriptions.change);
    },

    onFail(callback) {
      if(!isFunction(callback)) {
        throw new Error("invalid callback supplied");
      }
      subscriptions.fail.push(callback);
    },

    offFail(callback) {
      subscriptions.fail = filter((subscriber) => {
        return subscriber !== callback;
      }, subscriptions.fail);
    },

    getState() {
      return currentState;
    }

  };

  return fsm;
}
