const Webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const webpackConfig = require('./../webpack.config');
const path = require('path');
// const fs = require('fs');
//
// const mainPath = path.resolve(__dirname, '..', 'app', 'main.js');

module.exports = function () {

  // init webpack configuration
  var bundleStart = null;
  const compiler = Webpack(webpackConfig);

  // log the time begin bundling
  compiler.plugin('compile', function () {
    console.log('Bundling');
    bundleStart = Date.now();
  });

  // log the time end bundling
  compiler.plugin('compile', function () {
    console.log('Bundled in ' + (Date.now() - bundleStart) + 'ms!');
  });

  const bundler = new WebpackDevServer(compiler, {
    // tell webpack to server bundled application from
    // build Path. When proxying:
    // http://localhost:3000/build -> http://localhost:8080/build
    publicPath: '/build/',

    // config hot replacement
    hot: true,

    // terminal configurations
    quiet: false,
    noInfo: true,
    stats: {
      colors: true
    }
  });

  // Fire the development server and print terminal
  bundler.listen(8080, 'localhost', function () {
    console.log('Bundling project, please wait ...');
  });
};
