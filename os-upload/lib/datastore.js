var knox = require('knox')
  , config = require('./config.js')
  , request = require('request')
  ;

// HACK: should this probably be somewhere nicer
if (config.mode != 'production') {
  knox = require('faux-knox');
}
  
exports.client = knox.createClient({
    key: config.s3.key
  , secret: config.s3.secret
  , bucket: config.s3.bucket
  , region: config.s3.region
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

