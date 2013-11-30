var store = require('../lib/datastore.js')
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

