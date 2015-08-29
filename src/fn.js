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

