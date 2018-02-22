var webpack = require('webpack');
var path = require("path");
var TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

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
      new TsConfigPathsPlugin()
    ]
  },
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.tsx?$/, loader: 'ts-loader' }
    ]
  },
  // plugins:[
  //   new webpack.optimize.CommonsChunkPlugin()
  // ],
  externals: { }
}
