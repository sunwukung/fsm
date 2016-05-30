# SWK-FSM

a finite state machine implementation written in Javascript

## Design Goals

* Avoid no-ops on resulting state machine object
* avoid generating event specific functions on object
* prefer generic API

## Tasks

* support actions (i.e transition aliasing)
* get state graph
* get available states from current state

## API

### FACTORY

The library exports a machine factory. Provide this with an state graph and it will generate a machine

var stateGraph = {
    initial: "foo",
    states: {
        foo: "bar"; // single static, target state
        bar: { // multiple target states
            baz: "baz"
            foo: () => ("foo")
        },
    actions: {
        next: {
            foo: "bar"; // single static, target state
            bar: { // multiple target states
                baz: "baz"
                foo: () => ("foo")
            },
        }
    }
}

### MACHINE

transition
trigger
onChange
onEnter
onExit
onFail
