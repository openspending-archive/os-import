var knox = require('knox')
  , config = require('./config.js')
  ;

// HACK: should this probably be somewhere nicer
if (config.mode != 'production') {
  knox = require('faux-knox');
}
  
exports.client = knox.createClient({
    key: config.s3.key
  , secret: config.s3.secret
  , bucket: config.s3.bucket
});

