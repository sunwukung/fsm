require("babel/register")

const expect = require("chai").expect,
  fsm = require("../dist/fsm")

describe("swk-fsm", function() {

  it("is an object", function() {
    expect(fsm).to.be.a("function")
  })

  describe("returns a state machine", function() {
    let machine = null
    beforeEach(function() {
      machine = fsm()
    })
    it("which is an object", function() {
      expect(machine).to.be.an("object")
    })
    describe("with these methods", function() {
      describe("canTransition", function() {
        expect(machine.canTransition).to.be.a("function")
      })
      describe("transition", function() {
        expect(machine.transition).to.be.a("function")
      })
    })
  })
})
