export function isObject(value) {
  const valueType = typeof value;
  if (value === null) {return false;}
  if (typeof value === "object") {
    if (value instanceof Array) {return false;}
    return true;
  }
  return false;
}

export function isArray(value) {
  return value instanceof Array;
};

export function isBoolean(value) {
  return value === true || value === false;
}

export function isNumber(value) {
  return typeof value ===  "number";
};

export function isString(value) {
  return typeof value === "string";
}

export function isFunction(value) {
  return typeof value === "function";
}
