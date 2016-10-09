import fsmFactory from "../src/fsm";
import stateConfig from "./state-config.js";

const machine = fsmFactory(stateConfig);
const example = document.getElementById("example");
const nextButton = document.getElementById("next-btn");
const fooButton = document.getElementById("foo-btn");
const barButton = document.getElementById("bar-btn");
const bazButton = document.getElementById("baz-btn");

const stateDisplay = document.getElementById("state-display");

machine.onChange(() => {
  stateDisplay.innerHTML = machine.getState();
});

machine.onFail((state, args) => {
  console.log(state, args)
  stateDisplay.innerHTML = "ERROR";
});

nextButton.addEventListener("click", () => {
  machine.trigger("next");
});

fooButton.addEventListener("click", () => {
  machine.transition("foo", 1);
});

barButton.addEventListener("click", () => {
  machine.transition("bar");
});

bazButton.addEventListener("click", () => {
  machine.transition("baz");
});
