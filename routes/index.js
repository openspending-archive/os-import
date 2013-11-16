var store = require('../lib/datastore.js')
  ;

exports.home = function(req, res) {
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
