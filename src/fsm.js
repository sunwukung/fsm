import {guard, isString, isFunction} from "./lib.js";

export default function(stateGraph, initialState) {

  guard(stateGraph, initialState);

  let currentState = initialState;

  const fsm = {

    canTransition(targetState, args) {
      const stateHandler = stateGraph[currentState];
      if (isString(stateHandler)) {
        return stateHandler === targetState;
      }
      if (isFunction(stateHandler)) {
        return stateHandler.apply(stateGraph, args) === targetState;
      }
      return false;
    },

    transition(targetState, ...args) {
      const stateHandler = stateGraph[currentState];
      if (fsm.canTransition(targetState, args)) {
        if (isFunction(stateHandler)) {
          currentState = stateHandler.apply(stateHandler, args);
        } else {
          currentState = targetState;
        }
      }
    },

    getState() {
      return currentState;
    }

  };

  return fsm;
}
