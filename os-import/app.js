var express = require('express');
var app = express();
var path = require('path');
var SSI = require('node-ssi');
var templatesDir = path.join(__dirname, 'src', 'templates');
var ssi = new SSI({baseDir: templatesDir});
app.use(express.static(path.join(__dirname, '/dist')));

app.get('/', function(request, response) {
  ssi.compileFile(
    path.join(templatesDir, 'index.html'),
    function(err, content) { response.send(content); }
  );
});

app.get('*', function(request, response) {
  ssi.compileFile(
    path.join(templatesDir, 'app.html'),
    function(err, content) { response.send(content); }
  );
});

module.exports = app;
