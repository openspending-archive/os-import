var
  express = require('express'),
  path = require('path'),
  SSI = require('node-ssi');

var
  app = express(),

  /* eslint-disable sort-vars */
  templatesDir = path.join(__dirname, 'src', 'templates'),

  /* eslint-enable sort-vars */
  ssi = new SSI({baseDir: templatesDir});

app.use(express.static(path.join(__dirname, '/dist')));

app.get('/', function(request, response) {
	ssi.compileFile(path.join(templatesDir, 'index.html'), function(err, content) { response.send(content); });
});

app.get('*', function(request, response) {
	ssi.compileFile(path.join(templatesDir, 'app.html'), function(err, content) { response.send(content); });
});

module.exports = app;
