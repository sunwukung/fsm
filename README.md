# SWK-FSM

a finite state machine implementation written in Javascript


## Design Goals

* Avoid no-ops on resulting state machine object
* avoid generating event specific functions on object
* prefer generic API


### State Machine Factory

The library exports a machine factory. Provide this with a state graph
and it will generate a machine. The factory will validate the graph
before it attempts to produce a machine. You can supply a custom error
reporter in the options argument. The factory (and the machine it
produces) will both use the provided error reporting function
provided, but will throw exceptions otherwise.


### swk-fsm(graph, options) -> stateMachine

    const stateGraph = {
        initial: "foo",
        states: {
            foo: "baz",
            bar: ["foo", "baz"],
            baz: {
                foo: (val) => {
                    return val === 1 ? "bar" : "baz";
                },
            }
        },
        actions: {
            next: [
                {from: "foo", to "bar"}
            ]
        }
    };

    const errorReporter = (err) => {
        console.log(err);
    }


### transition(targetState {String}, ...args)

move the machine from it's current state to the target state, if
available. The method is variadic, all additional arguments will be
passed to the state handler


### trigger(action {String}, ...args)

evaluate the transition specified within the registered action


### onEnter|Exit(state {String}, callback {Function})

notify the callback when the machine enters/exits the specified state


### offEnter|Exit(state {String}, callback {Function})

remove the callback for enter/exit events for the specified state


### onChange|Fail|Terminate(callback {Function})

notify the callback when the machine performs anyone of the specified
events.


### offChange|Fail(callback {Function})

remove the callback for the specified machine event. There is no
corresponding ability to remove a termination event subscription, as
the machine cannot exit a terminal state.




