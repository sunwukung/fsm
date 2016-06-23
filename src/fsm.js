import {validateTargetState, validateConstruction, validateSubscription} from "./validation";
import {isArray, isFunction, isNumber, isObject, isString} from "./types";
import {contains, filter} from "ramda";

const INVALID_CALLBACK_ERROR = "Invalid callback supplied";

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
  if (isArray(stateHandler)) {
    return _useArrayHandler(stateHandler, targetState, currentState);
  }
  if (isObject(stateHandler)) {
    return _useObjectHandler(stateHandler, targetState, currentState, stateGraph, args);
  }
  console.warn(
    "stateHandler was an unsupported type - expected [ string | array | function ] - received",
    typeof stateHandler
  );
  return currentState;
};

function isTerminated(key, target) {
  return key === target;
}

/**
* @param {object} stateGraph
* @param {string} initialState
*/
export default function(spec) {
  validateConstruction(spec);
  const states = spec.states;
  const actions = spec.actions;
  const stateKeys = Object.keys(states);
  const subscriptions = _compileSubscriptionKeys(states);
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
      if (isTerminated(currentState, states[currentState])) {
        return false;
      }
      nextState = handleTransition(targetState, startState, stateHandler, states, args);
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
        currentState = nextState;
        if (isTerminated(currentState, states[currentState])) {
          subscriptions.terminate.forEach((subscriber) => {
            subscriber(startState, currentState, args);
          });
        }
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
        throw new Error(INVALID_CALLBACK_ERROR);
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
        throw new Error(INVALID_CALLBACK_ERROR);
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

    onTerminate(callback) {
      if (!isFunction(callback)) {
        throw new Error(INVALID_CALLBACK_ERROR);
      }
      subscriptions.terminate.push(callback);
    },

    getState() {
      return currentState;
    },

    trigger(action, ...args) {
      if(!isString(action)) {
        throw new Error("trigger requires string as first argument");
      }
      const transitionSpec = actions[action];
      let selectedTransition = undefined;
      transitionSpec.forEach((transition) => {
        if (isArray(transition.from)) {
          transition.from.forEach((from) => {
            // require validation of array elments
            if (isString(from) && from === currentState) {
              selectedTransition = transition;
            }
          });
        }
        if (isString(transition.from) && transition.from === currentState) {
          selectedTransition = transition;
        }
      });
      if (selectedTransition) {
        let targetState = currentState;
        if (isString(selectedTransition.to)) {
          targetState = selectedTransition.to;
        }
        if (isFunction(selectedTransition.to)) {
          targetState = selectedTransition.to.apply(null, [currentState].concat(args));
        }
        if (!validateTargetState(targetState, Object.keys(states))) {
          return;
        }
        const payload = _buildPayload(targetState, args);
        fsm.transition.apply(null, payload);
      }

    }
  };

  return fsm;
}

/**
* @param {string} targetState
* @param {array} args
*/
function _buildPayload(targetState, args) {
  return [targetState].concat(args);
}

/**
* @param {object} stateGraph
*/
function _compileSubscriptionKeys(stateGraph) {
  let subscriptionKeys = {
    enter: {},
    exit: {},
    fail: [],
    change: [],
    terminate: []
  };
  Object.keys(stateGraph).forEach((key) => {
    subscriptionKeys.enter[key] = [];
    subscriptionKeys.exit[key] = [];
  });
  return subscriptionKeys;
}


/**
* @param {string} stateHandler
* @param {string} targetState
* @param {string} currentState
*/
function _useStringHandler(stateHandler, targetState, currentState) {
  return stateHandler === targetState ? targetState : currentState;
}

/**
* @param {function} stateHandler
* @param {string} targetState
* @param {string} currentState
* @param {object} stateGraph
* @param {array} args
*/
function _useFunctionHandler(stateHandler, targetState, currentState, stateGraph, args) {
  const result = stateHandler.apply(stateGraph, args);
  if (result === true) {
    return targetState;
  }
  if (result !== false) {
    console.warn("predicate state handler did not return a boolean");
  }
  return currentState;
}

/**
* @param {array} stateHandler
* @param {string} targetState
* @param {string} currentState
*/
function _useArrayHandler(stateHandler, targetState, currentState) {
  let found = false;
  stateHandler.forEach((availableState) => {
    if (!found && (availableState === targetState)) {
      found = true;
    }
  });
  return found ? targetState : currentState;
}

/**
* @param {object} stateHandler
* @param {string} targetState
* @param {string} currentState
* @param {object} stateGraph
* @param {array} args
*/
function _useObjectHandler(stateHandler, targetState, currentState, stateGraph, args) {
  if (stateHandler[targetState] === true) {
    return stateHandler[targetState] ? targetState : currentState;
  }
  if (isFunction(stateHandler[targetState])) {
    return _useFunctionHandler(stateHandler[targetState], targetState, currentState, stateGraph, args);
  }
}

