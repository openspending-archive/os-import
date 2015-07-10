var knox = require('knox')
  , config = require('../config')
  , request = require('request')
  ;

// HACK: should this probably be somewhere nicer
if (!config.get('debug')) {
  knox = require('faux-knox');
}
  
exports.client = knox.createClient({
    key: config.get('s3.key')
  , secret: config.get('s3.secret')
  , bucket: config.get('s3.bucket')
  , region: config.get('s3.region')
});

exports.authorizedToUpload = function(apikey, dataset, cb) {
  var url = 'https://openspending.org/api/2/permissions?dataset=' + dataset;
  request.get({
    url: url,
    headers: {
      Authorization: 'ApiKey ' + apikey
    }
  }, function(err, resp, body) {
    if (err) cb(err)
    else {
      var data = JSON.parse(body);
      var ok = (data.create === true || data.update === true);
      cb(err, ok);
    }
  });
};

