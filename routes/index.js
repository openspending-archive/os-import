var store = require('../lib/datastore.js')
  , fs = require('fs')
  , request = require('request')
  , datapackage = require('datapackage')
  ;

exports.home = function(req, res) {
  if (! req.cookies.apikey ) {
    res.redirect('/login');
  }

  res.render('index.html', {
    title: 'Home'
  });
}

exports.uploadPost = function(req, res) {
  store.client.putFile(req.files.datafile.path, 'abc', function(err, result) {
    if (err) {
      res.send('error');
    } else {
      res.send('ok ' + result);
    }
  });
}

exports.login = function(req, res) {
  res.render('login.html', {
    title: 'Login'
  });
}

exports.loginPost = function(req, res) {
  res.cookie('apikey', req.body.apikey, {maxAge: 9000000});
  res.redirect('/');
}

exports.checkFile = function(req, res) {
  if (req.files) {
    var stream = fs.createReadStream(req.files.datafile.path, {encoding: 'utf8'});
  } else if (req.body.url) {
    var stream = request(req.body.url);
  }
  datapackage.createJsonTableSchema(stream, function(err, data) {
    if (err) {
      res.json({
        error: true,
        message: data
      });
    } else {
      res.json(data);
    }
  });
};

