var mode = process.env.NODE_ENV || 'testing'
  , defaultBucket = mode === 'testing' ? '/tmp/os-upload' : 'data.openspending.org'
  ;

var config = {
    mode: mode
  , bucket: process.env.BUCKET
  , s3: {
    key: process.env.S3_KEY,
    secret: process.env.S3_SECRET,
    bucket: process.env.S3_BUCKET || defaultBucket
  }
}

module.exports = config;

