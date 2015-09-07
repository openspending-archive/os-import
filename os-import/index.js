var app = require('./app');
var port = process.env.PORT || 3000;

app.listen(port, function() {
  console.log('OS-import is being served at :' + port);
});
