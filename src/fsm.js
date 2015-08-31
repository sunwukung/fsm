import {validateTargetState, validateConstruction, validateSubscription} from "./validation";
import {isFunction, isArray, isNumber, isObject, isString} from "./types";
import {contains, filter} from "./fn";

/**
* @param {object} stateGraph
*/
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

/**
* @param {string} targetState
* @param {string} currentState
* @param {mixed} stateHandler
* @param {object} stateGraph
* @param {array} args
*/
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

/**
* @param {object} stateGraph
* @param {string} initialState
*/
export default function(stateGraph, initialState) {
  validateConstruction(stateGraph, initialState);
  const subscriptions = compileSubscriptionKeys(stateGraph);
  let currentState = initialState;
  const stateKeys = Object.keys(stateGraph);
  const fsm = {
    /**
     * @param {string} targetState
     */
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

    /**
     * @param {string} stateKey
     * @param {function} callback
     */
    onEnter(stateKey, callback) {
      validateSubscription(stateKey, callback, stateGraph);
      subscriptions.enter[stateKey].push(callback);
    },

    /**
     * @param {string} stateKey
     * @param {function} callback
     */
    offEnter(stateKey, callback) {
      subscriptions.enter[stateKey] = filter((subscriber) => {
        return subscriber !== callback;
      }, subscriptions.enter[stateKey]);
    },

    /**
     * @param {string} state
     * @param {function} callback
     */
    onExit(state, callback) {
      validateSubscription(state, callback, stateGraph);
      subscriptions.exit[state].push(callback);
    },

    /**
     * @param {string} state
     * @param {function} callback
     */
    offExit(state, callback) {
      subscriptions.exit[state] = filter((subscriber) => {
        return subscriber !== callback;
      }, subscriptions.exit[state]);
    },

    /**
     * @param {function} callback
     */
    onChange(callback) {
      if(!isFunction(callback)) {
        throw new Error("invalid callback supplied");
      }
      subscriptions.change.push(callback);
    },

    /**
     * @param {function} callback
     */
    offChange(callback) {
      subscriptions.change = filter((subscriber) => {
        return subscriber !== callback;
      }, subscriptions.change);
    },

    /**
     * @param {function} callback
     */
    onFail(callback) {
      if(!isFunction(callback)) {
        throw new Error("invalid callback supplied");
      }
      subscriptions.fail.push(callback);
    },

    /**
     * @param {function} callback
     */
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
