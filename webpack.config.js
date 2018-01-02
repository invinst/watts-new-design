const Webpack = require('webpack');

const path = require('path');
const nodeModulesPath = path.resolve(__dirname, 'node_modules');
const buildPath = path.resolve(__dirname, 'public', 'build');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const jsMainPath = path.resolve(__dirname, 'app', 'js', 'main.js');
const cssMainPath = path.resolve(__dirname, 'app', 'scss', 'main.scss');


const config = {
  // Make sure errors in console map to the correct file and line number
  devtool: 'eval-source-map', // use `eval` if need line number only, eval-source-map so slow
  entry: [
    // For hot style updates
    'webpack/hot/dev-server',

    // The script refreshing the browser on none hot updates
    'webpack-dev-server/client?http://localhost:8080',

    // Our application
    jsMainPath,
    cssMainPath
  ],
  resolve: {
    alias: {
      'TweenLite': path.resolve('node_modules', 'gsap/src/uncompressed/TweenLite.js'),
      'TweenMax': path.resolve('node_modules', 'gsap/src/uncompressed/TweenMax.js'),
      'TimelineLite': path.resolve('node_modules', 'gsap/src/uncompressed/TimelineLite.js'),
      'TimelineMax': path.resolve('node_modules', 'gsap/src/uncompressed/TimelineMax.js'),
      'ScrollMagic': path.resolve('node_modules', 'scrollmagic/scrollmagic/uncompressed/ScrollMagic.js'),
      'animation.gsap': path.resolve('node_modules', 'scrollmagic/scrollmagic/uncompressed/plugins/animation.gsap.js'),
      'debug.addIndicators': path.resolve('node_modules', 'scrollmagic/scrollmagic/uncompressed/plugins/debug.addIndicators.js')
    },
  },
  output: {
    // We need to give Webpack a path. It does not actually need it,
    // because files are kept in memory in webpack-dev-server, but an
    // error will occur if nothing is specified. We use the buildPath
    // as that points to where the files will eventually be bundled
    // in production
    path: buildPath,
    filename: '[name].bundle.js',

    // Everything related to Webpack should go through a build path,
    // localhost:3000/build. That makes proxying easier to handle
    publicPath: '/build/'
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: [nodeModulesPath]
    }, {
      test: /\.(css|sass|scss)$/,
      use: ExtractTextPlugin.extract({
        use: [
          {
            loader: 'css-loader',
            options: { sourceMap: true }
          },
          // {
          //   loader: 'postcss-loader', // Run post css actions
          //   options: {
          //     sourceMap: true,
          //     plugins: function () { // post css plugins, can be exported to postcss.config.js
          //       return [
          //         require('precss'),
          //         require('autoprefixer')
          //       ];
          //     }
          //   }
          // },
          {
            loader: 'sass-loader',
            options: { sourceMap: true }
          }
        ],
        fallback: 'style-loader'
      })
    }, {
      // test: /\.(png|woff|woff2|eot|ttf|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      // loader: 'url-loader'
      test: /\.(png|woff|woff2|eot|ttf|svg)$/,
      loader: 'url-loader?limit=100000'
    }],

  },
  // Manually add the Hot Replacement plugin when running from Node
  plugins: [
    new Webpack.HotModuleReplacementPlugin(),
    new ExtractTextPlugin({ // define where to save the file
      filename: '[name].bundle.css',
      allChunks: true,
    })
  ]
};

module.exports = config;
