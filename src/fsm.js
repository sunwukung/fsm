export default (states, startState) => {
  const fsm = {
    states,

    currentState: startState,

    canTransition(targetState) {
      states[currentState].to === targetState
    },

    transition(targetState) {
      if (fsm.canTransition(targetState)) {
        currentState = targetState
      }
    },
  }


  return fsm
}
