function isObject(o) {
  const oType = typeof o;
  let isObject = false;
  if (oType === "object") {
    isObject = true;
  }
  return isObject;
}

function isString(s) {
  return typeof s === "string";
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

export function guard(stateGraph, initialState) {

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




