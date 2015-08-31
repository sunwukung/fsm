import {isObject, isArray, isNumber, isString, isFunction} from "./types";

/**
 * @param {function} predicate
 * @param {array} list
 */
export function filter(predicate, list) {
  let i = 0;
  let filtered = [];
  for (i; i < list.length; i++) {
    if (predicate(list[i])) {
      filtered.push(list[i]);
    }
  }
  return filtered;
};

/**
 * determines if item is in list
 * @param {string} item
 * @param {array} list
 */
export function contains(item, list) {
  let i = 0;
  for (i; i < list.length; i++) {
    if (item == list[i]) {return true;}
  }
  return false;
};

/**
 * executes success if predicate evaluates to true
 * @param {function} predicate
 * @param {function} success
 * @param {function} fail
 */
export function cond(predicate, success, fail) {
  return () => {
    if (predicate.apply(predicate, arguments) === true) {
      return success.apply(success, arguments);
    }
    return fail.apply(fail, arguments);
  };
};
