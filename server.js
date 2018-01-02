var express = require('express');
var path = require('path');

var httpProxy = require('http-proxy');
var indexRoute = require('./routes/index');

// We need to add a configuration to our proxy server,
// as we are now proxying outside localhost
var proxy = httpProxy.createProxyServer({
  changeOrigin: true
});

var app = express();

var isProduction = process.env.NODE_ENV === 'production';
var port = isProduction ? process.env.PORT : 3000;
var publicPath = path.resolve(__dirname, 'public');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// We point to our static assets
app.use(express.static(publicPath));
app.use('/', indexRoute);

// if not production, then run workflow
if (!isProduction) {
  // ONLY require bundle if production
  var bundle = require('./server/bundle.js');
  bundle();

  // Any requests to localhost:3000/build is proxied
  // to webpack-dev-server
  app.all('/build/*', function (req, res) {
    proxy.web(req, res, {
      target: 'http://localhost:8080'
    });
  });
}

proxy.on('error', function (e) {
  console.warn('Could not connect to proxy, please try again...');
});

// Run the server
app.listen(port, function () {
  console.log('Server running on port ' + port);
});
