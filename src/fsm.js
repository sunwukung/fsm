import {validateTargetState, validateConstruction, validateSubscription} from "./validation";
import {isArray, isBool, isFunction, isNumber, isObject, isString} from "./types";
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

function _useStringHandler(stateHandler, targetState, currentState) {
  return stateHandler === targetState ? targetState : currentState;
}

function _useFunctionHandler(stateHandler, targetState, currentState, stateGraph, args) {
  const result = stateHandler.apply(stateGraph, args);
  if (result === true) {
    return targetState;
  }
  if (result !== false) {
    console.warn("STATE HANDLER DID NOT RETURN A BOOLEAN");
  } else {
    return currentState;
  }
}

function _useArrayHandler(stateHandler, targetState, currentState) {
  let found = false;
  stateHandler.forEach((availableState) => {
    if (!found && (availableState === targetState)) {
      found = true;
    }
  });
  return found ? targetState : currentState;
}

function _useObjectHandler(stateHandler, targetState, currentState, stateGraph, args) {
  if (isString(stateHandler[targetState])) {
    return _useStringHandler(stateHandler[targetState], targetState, currentState);
  }
  if (isFunction(stateHandler[targetState])) {
    return _useFunctionHandler(stateHandler[targetState], targetState, currentState, stateGraph, args);
  }
}

/**
* @param {string} targetState
* @param {string} currentState
* @param {mixed} stateHandler
* @param {object} stateGraph
* @param {array} args
*/
function handleTransition(targetState, currentState, stateHandler, stateGraph, args) {
  if (isString(stateHandler)) {
    return _useStringHandler(stateHandler, targetState, currentState);
  }
  if (isObject(stateHandler)) {
    return _useObjectHandler(stateHandler, targetState, currentState, stateGraph, args);
  }
  return currentState;
};

/**
* @param {object} stateGraph
* @param {string} initialState
*/
export default function(spec) {
  validateConstruction(spec);
  const states = spec.states;
  const stateKeys = Object.keys(states);
  const subscriptions = compileSubscriptionKeys(states);
  let currentState = spec.initial;
  let nextState;

  const fsm = {
    /**
     * @param {string} targetState
     */
    transition(targetState, ...args) {
      const stateHandler = states[currentState];
      const startState = currentState;

      validateTargetState(targetState, stateKeys);
      nextState = handleTransition(targetState, currentState, stateHandler, states, args);
      if (startState !== nextState) {
        subscriptions.exit[startState].forEach((subscriber) => {
          subscriber(startState, nextState, args);
        });
        subscriptions.enter[nextState].forEach((subscriber) => {
          subscriber(startState, nextState, args);
        });
        subscriptions.change.forEach((subscriber) => {
          subscriber(startState, nextState, args);
        });
      } else {
        subscriptions.fail.forEach((subscriber) => {
          subscriber(startState, args);
        });
      }

    },

    /**
     * @param {string} stateKey
     * @param {function} callback
     */
    onEnter(stateKey, callback) {
      validateSubscription(stateKey, callback, states);
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
      validateSubscription(state, callback, states);
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
      return nextState;
    },
    trigger(action, ...args) {
      if(!isString(action)) {
        throw new Error("trigger requires string as first argument");
      }

      //
    }
  };

  return fsm;
}
