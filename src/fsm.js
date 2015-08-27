import {guard} from "./lib.js";

export default function(stateGraph, initialState) {

  guard(stateGraph, initialState);

  let currentState = initialState;

  const fsm = {

    canTransition(targetState) {
      return stateGraph[currentState] === targetState;
    },

    transition(targetState) {
      if (fsm.canTransition(targetState)) {
        currentState = targetState;
      }
    },

    getState() {
      return currentState;
    }

  };

  return fsm;
}
