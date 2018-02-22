var webpack = require('webpack');
var path = require("path");
var { TsConfigPathsPlugin } = require('awesome-typescript-loader');

function resolve(dir){
  return path.join(__dirname, '..', dir);
}

module.exports = {
  entry: {
    'dist/tng': './src/tiny-ng/index',
    'dist/tng-polyfills': './src/polyfills',
    'examples/tour-of-heroes/dist/app': './examples/tour-of-heroes/src/app.module',
    'examples/todomvc/dist/app': './examples/todomvc/src/app.module'    
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, './'),
    library: "tiny-ng",
    libraryTarget: "umd"
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
  },
  // plugins:[
  //   new webpack.optimize.CommonsChunkPlugin()
  // ],
  externals: { }
}
