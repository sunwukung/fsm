# FSM

## constructor(stateGraph, initialState)

## action(id, ctx)

perform a predefined transition sequence using a named alias

## getState()

return the current state of the machine

## onChange(handler)

attach a handler that listens to changes in state
change handlers receive an object thus:

```js
{
    previous: previousState,
    current: currentState
}
```

## onError(handler)

attach a handler that listens to machine errors
error handlers receive an object thus:

```js
{
    target: previousState,
    current: currentState
}
```

## removeChangeSubscription(subscription)

remove the change handler by reference

## removeErrorSubscription(subscription)

remove the error handler by reference

## transition(targetState)

transition the machine state to the target state

# factory

wrapper to guarantee new keyword
