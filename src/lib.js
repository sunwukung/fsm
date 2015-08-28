export function isObject(value) {
  const valueType = typeof value;
  if (value === null) {return false;}
  if (typeof value === "object") {
    if (value instanceof Array) {return false;}
    return true;
  }
  return false;
}

export function isString(value) {
  return typeof value === "string";
}

export function isFunction(value) {
  return typeof value === "function";
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

function isValidStateGraph(stateGraph) {
  return Object.keys(stateGraph).length > 1;
}

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

export function validateConstruction(stateGraph, initialState) {

  if (!isObject(stateGraph)) {
    throw new Error("state graph is not an object");
  }

  if (!isString(initialState)) {
    throw new Error("initial state is not a string");
  }

  if (!isValidStateGraph(stateGraph)) {
    throw new Error("state graph is invalid");
  }

  if (!isValidInitialState(stateGraph, initialState)) {
    throw new Error("initial state cannot be found in state graph");
  }

};

export function validateSubscription(stateKey, callback, stateGraph) {

  if(!isString(stateKey)) {
    throw new Error("state key is not a string");
  }

  if (!isValidSubscription(stateKey, stateGraph)) {
    throw new Error("no state matches subscription key");
  }

  if(!isFunction(callback)) {
    throw new Error("callback is not a function");
  }

};




