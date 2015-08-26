var
	express = require('express'),
	path = require('path');

var
	app = express();

app.use(express.static(path.join(__dirname, '/dist')));
app.get('/', function(request, response) { response.sendFile(path.join(__dirname, '/src/templates/index.html')); });
app.get('*', function(request, response) { response.sendFile(path.join(__dirname, '/src/templates/app.html')); });
module.exports = app;
