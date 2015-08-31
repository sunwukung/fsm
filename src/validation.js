import {contains} from "./fn.js";
import {isObject, isArray, isNumber, isString, isFunction} from "./types";

let errorReporter = function(message) {
  throw new Error(message);
};

function reportError(message) {
  errorReporter(message);
};

function isValidStateGraph(stateGraph) {
  return Object.keys(stateGraph).length > 1;
}

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

export function validateArguments(expectation, args) {

};

export function validateTargetState(targetState, stateKeys) {
  if (!isString(targetState)) {
    reportError("state key must be a string");
  };
  if (!contains(targetState, stateKeys)) {
    reportError("state key could not be found in the state graph");
  }
};

export function validateConstruction(stateGraph, initialState) {

  if (!isObject(stateGraph)) {
    reportError("state graph is not an object");
  }

  if (!isString(initialState)) {
    reportError("initial state is not a string");
  }

  if (!isValidStateGraph(stateGraph)) {
    reportError("state graph is invalid");
  }

  if (!isValidInitialState(stateGraph, initialState)) {
    reportError("initial state cannot be found in state graph");
  }

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




