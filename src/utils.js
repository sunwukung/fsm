const { compose, find, filter, forEach, is, contains, prop } = require("ramda");

const isArray = is(Array);
const isFunction = is(Function);

const locateSubAction = (action, currentState) =>
  find(
    compose(
      contains(currentState),
      prop("from")
    )
  )(action);

const notify = (type, notification, subscriptions) => {
  forEach(handler => {
    handler(notification);
  }, subscriptions[type]);
}

const processSubAction = (subAction, ctx, inst) => {
  if (isFunction(subAction.to)) {
    const targetState = subAction.to(ctx, inst.currentState);
    return inst.transition(targetState);
  }
  return inst.transition(subAction.to);
}
const processAction = (action, ctx, inst) => {
  if (isArray(action)) {
    const subAction = locateSubAction(action, inst.currentState);
    if (subAction) {
      processSubAction(subAction, ctx, inst);
    } else {
      notify("error", { current: inst.currentState }, inst._subscriptions);
    }
  }
}

const removeSubscription = (type, subscription, subscriptions) => {
  subscriptions[type] = filter(
    item => item !== subscription,
    subscriptions[type]
  );
  return subscriptions
}

module.exports = { processAction, notify, removeSubscription }
