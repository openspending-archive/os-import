var 
    express = require('express')
  , app = express()
  , config = require('./config')
  , cookieParser = require('cookie-parser')
  , bodyParser = require('body-parser')
  , flash = require('connect-flash')
  , methodOverride = require('method-override')
  , nunjucks = require('nunjucks')
  , path = require('path')
  , routes = require('./routes/index.js')
  , session = require('express-session')
  , sessionSecret = process.env.SESSION_SECRET || ['open', 'data', 'spending']
  , viewsPath = __dirname + '/views'
  ;

// General config
app.set('config', config);
app.set('port', config.get('appconfig:port'));

// Setup middlewares
app.use([
  cookieParser(),
  bodyParser.urlencoded({extended: true}),
  bodyParser.json(),
  methodOverride(),
  session({secret: sessionSecret, resave: true, saveUninitialized: true}),
  flash(),
]);

// Templates
nunjucks.configure(viewsPath, {express: app});

app.listen(app.get('port'), function() { console.log('Listening on ' + app.get('port')); });

app.all('*', function(req, res, next) {
  if (config.get('debug')) {
    req.cookies.apikey = config.get('apikey');
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
