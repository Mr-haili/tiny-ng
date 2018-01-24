var path = require("path");
var { TsConfigPathsPlugin } = require('awesome-typescript-loader');

function resolve(dir){
  return path.join(__dirname, '..', dir);
}

module.exports = {
  entry: {
    'dist/app': './src/main.ts',
    'examples/tiny-ng-tour-of-heroes/dist/app': './examples/tiny-ng-tour-of-heroes/src/app.module'
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, './')
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"],
    plugins: [
      new TsConfigPathsPlugin(/* { configFileName, compiler } */)
    ]
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: "awesome-typescript-loader" },
    ]
  }
}
