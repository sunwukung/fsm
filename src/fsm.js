const { contains, forEach } = require("ramda");
const { notify, processAction, removeSubscription } = require('./utils')
class FSM {
  constructor({ states, actions }, initialState) {
    this._subscriptions = {
      change: [],
      error: []
    };
    this.states = states;
    this.actions = actions;
    this.currentState = initialState;
    this.getState = this.getState.bind(this);
    this.transition = this.transition.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onError = this.onError.bind(this);
    this.action = this.action.bind(this);
    this.removeChangeSubscription = this.removeChangeSubscription.bind(this);
    this.removeErrorSubscription = this.removeErrorSubscription.bind(this);
  }

  action(id, ctx) {
    return this.actions[id]
      ? processAction(this.actions[id], ctx, this)
      : this.currentState;
  }

  getState() {
    return this.currentState;
  }

  onChange(handler) {
    this._subscriptions.change.push(handler);
  }

  onError(handler) {
    this._subscriptions.error.push(handler);
  }

  removeChangeSubscription(subscription) {
    this.subscrtipions = removeSubscription("change", subscription, this._subscriptions);
  }

  removeErrorSubscription(subscription) {
    this._subscriptions = removeSubscription("error", subscription, this._subscriptions);
  }

  transition(targetState) {
    const stateNode = this.states[this.currentState];
    if (contains(targetState, stateNode)) {
      const previousState = this.currentState;
      this.currentState = targetState;
      return notify("change",
        { previous: previousState, current: this.currentState },
        this._subscriptions
      );
    }
    notify(
      "error",
      { current: this.currentState, target: targetState },
      this._subscriptions
    );
  }
}

const factory = (graph, initialState) => new FSM(graph, initialState);

module.exports = { factory, FSM };
