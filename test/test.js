var fs = require('fs')
    path = require('path')
  , request = require('supertest')
  , express = require('express')
  , assert = require('assert')
  , config = require('../lib/config.js')
  ;

var app = require('../app.js').app;

console.log(config.mode);
var localBucket = config.s3.bucket;

describe('API', function() {
  it('Upload', function(done) {
    request(app)
      .post('/')
      .attach('datafile', 'test/data/sample1.csv')
      .end(function(err, res) {
        // console.log(res);
        var fp = path.join(localBucket, 'abc');
        assert(fs.existsSync(fp), 'File not saved to expected location ' + fp);
        done();
      });
  });
});

