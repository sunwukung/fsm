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
    console.log("THE STATE HANDLER IS A STRING");
    return targetState;
  }
  if (isObject(stateHandler)) {
    console.log("THE STATE HANDLER IS AN OBJECT");
    if (isString(stateHandler[targetState])) {
      console.log("THE STATE HANDLER IS A STRING");
      return stateHandler[targetState];
    }
    if (isFunction(stateHandler[targetState])) {
      console.log("THE STATE HANDLER IS AN OBJECT");
      if (stateHandler[targetState].apply(stateGraph, args)) {
        currentState = targetState;
      } else {
        console.log("THE STATEHANDLER DID NOT RETURN A NEW STATE");
      }
    } else {
      console.log(stateHandler[targetState]);
      console.log(stateHandler);
      console.log("WAS EXPECTING A FUNCTION");
    }
  } else {
    console.log("WAS EXPECTING AN OBJECT");
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
  const subscriptions = compileSubscriptionKeys(states);
  let currentState = spec.initial;
  const stateKeys = Object.keys(states);
  const fsm = {
    /**
     * @param {string} targetState
     */
    transition(targetState, ...args) {
      const stateHandler = states[currentState];
      const stateAtTimeOfTransition = currentState;

      validateTargetState(targetState, stateKeys);
      currentState = handleTransition(targetState, currentState, stateHandler, states, args);

      if (stateAtTimeOfTransition !== currentState) {
        console.log("THE STATE SHOULD CHANGE");
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
      return currentState;
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
