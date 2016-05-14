require("babel-core/register")({
  presets: ["es2015", "stage-0"],
  ignore: false,
  only: [
    "./src",
    "./test",
  ],
})
