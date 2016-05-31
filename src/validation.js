import {contains} from "./fn.js";
import {isObject, isBoolean, isArray, isNumber, isString, isFunction} from "./types";

let errorReporter = function(message) {
  throw new Error(message);
};

function reportError(message) {
  errorReporter(message);
};

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


export function validateTargetState(targetState, stateKeys) {
  if (!isString(targetState)) {
    reportError("state key must be a string");
  };
  if (!contains(targetState, stateKeys)) {
    reportError("state key could not be found in the state graph");
  }
};

export function validateConstruction(stateGraph) {

  if (!isObject(stateGraph)) {
    reportError("state graph is not an object");
  }

  const states = stateGraph.states;
  const initialState = stateGraph.initial;
  const actions = stateGraph.actions;

  if (states === undefined) {
    reportError("'states' were not defined");
  }

  if (initialState === undefined) {
    reportError("'initial' was not defined");
  }

  if (!isObject(states)) {
    reportError("'states' is not an object");
  }

  if (!isString(initialState)) {
    reportError("'initial' is not a string");
  }

  if (!isValidStateGraph(states)) {
    reportError("state graph is invalid");
  }

  if (!isValidInitialState(states, initialState)) {
    reportError("initial state cannot be found in state graph");
  }

  validateActions(actions, states);

};

export function validateActions(actions, states) {
  if (actions !== undefined) {
    if (!isObject(actions)) {
      reportError("'actions' should be an object (if defined)");
    }
    const actionKeys = collectActionKeys(actions);
    const stateKeys = Object.keys(states);


  }
};

export function collectActionKeys(actions) {
  const keys = [];
  for (let action in actions) {
    if (actions.hasOwnProperty(action)) {
      const actionKeys = [];
      // parse arrays
      // parse strings
      // add to keys
      // also collect to targets
      // de-dupe the array
    }
  }
  return [];
};

export function validateSubscription(stateKey, callback, stateGraph) {

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

// TODO: check all the target states describe in the graph too
export function isValidStateGraph(stateGraph) {
  // there must be more than one state
  const states = Object.keys(stateGraph);
  return states.length > 1;
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

