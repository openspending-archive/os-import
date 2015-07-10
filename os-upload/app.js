var express = require('express')
  , flash = require('connect-flash')
  , path = require('path')
  , methodOverride = require('method-override')
  , routes = require('./routes/index.js')
  , session = require('express-session')
  , sessionSecret = process.env.SESSION_SECRET || ['open', 'data', 'spending']
  , cookieParser = require('cookie-parser')
  , bodyParser = require('body-parser')
  , config = require('./config')
  ;

var app = express();

// General config
app.set('config', config);
app.set('port', config.get('appconfig:port'));
app.set('views', __dirname + '/views');

// Setup middlewares
app.use([
  cookieParser(),
  bodyParser.urlencoded({extended: true}),
  bodyParser.json(),
  methodOverride(),
  session({secret: sessionSecret, resave: true, saveUninitialized: true}),
  flash(),
]);

app.listen(app.get('port'), function() {
  console.log("Listening on " + app.get('port'));
});

app.all('*', function(req, res, next) {
  if (config.mode === 'testing') {
    req.cookies.apikey = config.apikey;
  }
  next();
});

// Routes
app.get('/', routes.home);
app.post('/', routes.uploadPost);
app.get('/login', routes.login);
app.post('/login', routes.loginPost);
app.post('/api/1/check', routes.checkFile);

exports.app = app;
