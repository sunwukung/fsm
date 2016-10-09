var path = require("path");

module.exports = {
  entry: {
    example: [path.resolve(__dirname, "./../../examples/example.js")]
  },
  output: {
    path: path.resolve(__dirname, "../../examples"),
    publicPath: "/examples/assets/",
    filename: "bundle.js",
    watch: true
  },
  module: {
    loaders: [
      { test: /\.css$/, loader: "style-loader!css-loader" },
      {
        test: /\.js$/,
        query: {presets: ["es2015"]},
        loader: "babel-loader",
        exclude: path.resolve(__dirname, "../../node_modules/")
      }
    ]
  }
};
