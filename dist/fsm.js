"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports["default"] = function (states, startState) {

  var fsm = {

    states: states,

    currentState: startState,

    canTransition: function canTransition(targetState) {
      states[currentState].to === targetState;
    },

    transition: function transition(targetState) {
      if (fsm.canTransition(targetState)) {
        currentState = targetState;
      }
    }
  };

  return fsm;
};

module.exports = exports["default"];