require("babel/register")

const expect = require("chai").expect,
  fsm = require("../dist/fsm")

describe("swk-fsm", function() {

  it("is a function", function() {
    expect(fsm).to.be.a("function")
  })

  it("it returns an object", function() {
    const machine = fsm({}, "UNINITIALIZED")
    expect(machine).to.be.an("object")
  })

})

describe("methods", function() {
  let machine = {}

  beforeEach(function() {
    machine = fsm({}, "UNINITIALIZED")
  })

  it("canTransition", function() {
    expect(machine.canTransition).to.be.a("function")
  })

  it("transition", function() {
    expect(machine.transition).to.be.a("function")
  })

})
