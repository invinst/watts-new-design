// DEPLOY ON HEROKU
// Since postinstall will also run when you run npm install
// locally we make sure it only runs in production

if (process.env.NODE_ENV === 'production') {

  // We basically just create a child process that will run
  // the production bundle command
  var childProcess = require('child_process');
  childProcess.exec('webpack -p --config webpack.production.config.js', function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
    }
  });
}
