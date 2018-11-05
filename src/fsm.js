const { find, compose, contains, prop, is, forEach, filter } = require("ramda");

const isArray = is(Array);
const isFunction = is(Function);

const locateSubAction = (action, currentState) =>
  find(
    compose(
      contains(currentState),
      prop("from")
    )
  )(action);

class FSM {
  constructor({ states, actions }, initialState) {
    this.subscriptions = {
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
    this.notify = this.notify.bind(this);
    this.action = this.action.bind(this);
    this.processAction = this.processAction.bind(this);
    this.processSubAction = this.processSubAction.bind(this);
    this.removeSubscription = this.removeSubscription.bind(this);
    this.removeChangeSubscription = this.removeChangeSubscription.bind(this);
    this.removeErrorSubscription = this.removeErrorSubscription.bind(this);
  }

  action(id, ctx) {
    console.log("calling action");
    return this.actions[id]
      ? this.processAction(this.actions[id], ctx)
      : this.currentState;
  }

  getState() {
    return this.currentState;
  }

  notify(type, stateA, stateB) {
    forEach(handler => {
      handler(stateA, stateB);
    }, this.subscriptions[type]);
  }

  onChange(handler) {
    this.subscriptions.change.push(handler);
  }

  onError(handler) {
    this.subscriptions.error.push(handler);
  }

  processAction(action, ctx) {
    if (isArray(action)) {
      const subAction = locateSubAction(action, this.currentState);
      if (subAction) {
        this.processSubAction(subAction, ctx);
      } else {
        this.notify("error", { current: this.currentState });
      }
    }
  }

  processSubAction(subAction, ctx) {
    if (isFunction(subAction.to)) {
      const targetState = subAction.to(ctx, this.currentState);
      return this.transition(targetState);
    }
    return this.transition(subAction.to);
  }

  removeSubscription(type, subscription) {
    this.subscriptions[type] = filter(
      item => item !== subscription,
      this.subscriptions[type]
    );
  }

  removeChangeSubscription(subscription) {
    this.removeSubscription("change", subscription);
  }

  removeErrorSubscription(subscription) {
    this.removeSubscription("error", subscription);
  }

  transition(targetState) {
    const stateNode = this.states[this.currentState];
    if (contains(targetState, stateNode)) {
      const previousState = this.currentState;
      this.currentState = targetState;
      return this.notify("change", {
        previous: previousState,
        current: this.currentState
      });
    }
    this.notify("error", { current: this.currentState, target: targetState });
  }
}

const factory = (graph, initialState) => new FSM(graph, initialState);

module.exports = { factory, FSM };
