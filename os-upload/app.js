var express = require('express');
var app = express();


app.use(express.static(__dirname + '/dist'));
app.get('/', function(request, response){ response.sendFile(__dirname + '/src/templates/index.html'); });
app.get('*', function(request, response){ response.sendFile(__dirname + '/src/templates/app.html'); });
module.exports = app;
