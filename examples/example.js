import fsmFactory from "../src/fsm";
const example = document.getElementById("example");
const next = document.getElementById("next-btn");

import stateConfig from "./state-config.js";
console.log(stateConfig);

next.addEventListener("click", () => {
  console.log("clicked");
});
