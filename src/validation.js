import {contains, curry, difference} from "ramda";
import {
  isObject,
  isBoolean,
  isArray,
  isNumber,
  isString,
  isFunction
} from "./types";

function isValidInitialState(stateGraph, initialState) {
  const stateKeys = Object.keys(stateGraph);
  let validInitialState = false;
  stateKeys.forEach((stateKey) => {
    if (stateKey === initialState) {
      validInitialState = true;
    }
  });
  return validInitialState;
};

function isValidSubscription(stateKey, stateGraph) {
  const stateKeys = Object.keys(stateGraph);
  let validStateKey = false;
  stateKeys.forEach((key) => {
    if (stateKey === key) {
      validStateKey = true;
    }
  });
  return validStateKey;
};


export function validateTargetState(reportError, targetState, stateKeys) {
  if (!isString(targetState)) {
    reportError("state key must be a string");
    return false;
  };
  if (!contains(targetState, stateKeys)) {
    reportError("state key could not be found in the state graph");
    return false;
  }
  return true;
};

export function validateConstruction(reportError, stateGraph) {

  if (!isObject(stateGraph)) {
    reportError("state graph is not an object");
  }

  const states = stateGraph.states;
  const initialState = stateGraph.initial;
  const actions = stateGraph.actions;

  if (states === undefined) {
    return reportError("'states' were not defined");
  }

  if (initialState === undefined) {
    return reportError("'initial' was not defined");
  }

  if (!isObject(states)) {
    return reportError("'states' is not an object");
  }

  if (!isString(initialState)) {
    return reportError("'initial' is not a string");
  }

  if (!isValidInitialState(states, initialState)) {
    return reportError("initial state cannot be found in state graph");
  }

  if (!isValidStateGraph(reportError, states, initialState)) {
    return reportError("state graph is invalid");
  }

  validateActions(reportError, actions, Object.keys(states));

};

const _validateTransition = curry((reportError, stateKeys, transition) => {
  if (!isObject(transition)) {
    return reportError("transitions defined in actions should be an object");
  }
  if (transition.from === undefined) {
    return reportError("transitions defined in actions should contain a 'from' property");
  }
  if (!isString(transition.from) && !isArray(transition.from)) {
    return reportError("from properties should be a string or an array");
  }

  if (isArray(transition.from)) {
    transition.from.forEach((fromState) => {
      if (!isString(fromState)) {
        return reportError("elements in from arrays must be strings");
      }
      if (!contains(fromState, stateKeys)) {
        return reportError("from properties should be valid states");
      }
    });
  }

  if (transition.to === undefined) {
    return reportError("transitions defined in actions should contain a 'to' property");
  }

  if (!isString(transition.to) && !isFunction(transition.to)) {
    return reportError("to properties should be a string or a function");
  }

  return true;
});

function _validateAction(reportError, action, stateKeys) {
  if (!isArray(action)) {
    return reportError("'actions' should contain arrays");
  }
  action.forEach(_validateTransition(reportError, stateKeys));
}

export function validateActions(reportError, actions, stateKeys) {
  let action;

  if (actions !== undefined) {
    if (!isObject(actions)) {
      return reportError("'actions' should be an object (if defined)");
    }
    for (action in actions) {
      _validateAction(reportError, actions[action], stateKeys);
    }
  }
};

export function validateSubscription(reportError, stateKey, callback, stateGraph) {
  if(!isString(stateKey)) {
    reportError("state key is not a string");
  }
  if (!isValidSubscription(stateKey, stateGraph)) {
    reportError("no state matches subscription key");
  }
  if(!isFunction(callback)) {
    reportError("callback is not a function");
  }
};

export function isValidStateGraph(reportError, stateGraph, initialState) {
  const states = Object.keys(stateGraph);
  if (states.length <= 1) {
    reportError("there is only one state in the state graph");
    return false;
  }
  const targetStates = collectTargetStates(stateGraph);
  const stateDiff = difference(states, targetStates);
  if ((stateDiff.length === 1) && (stateDiff[0] === initialState)) {
    return true;
  }
  if (stateDiff.length > 0) {
    reportError("these states are unreachable: " + stateDiff.join(","));
    return false;
  }
  const targetDiff = difference(targetStates, states);
  if (targetDiff.length > 0) {
    reportError("these target states do not exist in the graph: " + targetDiff.join(","));
    return false;
  }
  return true;
};


function updateMultipleKeys(newKeys, keys) {
  newKeys.forEach((key) => {
    if (!contains(key, keys)) {
      keys.push(key);
    }
  });
  return keys;
}

export function collectTargetStates(stateGraph) {
  let targetStates = [];
  for (let stateHandler in stateGraph) {
    const handler = stateGraph[stateHandler];
    if (isString(handler) && !contains(handler, targetStates)) {
      targetStates.push(handler);
    }
    if (isArray(handler)) {
      targetStates = updateMultipleKeys(handler, targetStates);
    }
    if (isObject(handler)) {
      targetStates = updateMultipleKeys(Object.keys(handler), targetStates);
    }
  }
  return targetStates.sort();
};

