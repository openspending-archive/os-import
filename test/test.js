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

  it('checks', function(done) {
    var exp = {
      "fields": [
        {
          "name": "h1",
          "description": "",
          "type": "string"
        },
        {
          "name": "h2",
          "description": "",
          "type": "string"
        },
        {
          "name": "h3",
          "description": "",
          "type": "string"
        }
      ]
    };
    request(app)
      .post('/api/1/check')
      .attach('datafile', 'test/data/sample1.csv')
      .expect(exp)
      .end(function(err, res) {
        if (err) return done(err);
        done();
      });
  });
  it('checks - bad data', function(done) {
    request(app)
      .post('/api/1/check')
      .send({
        url: 'https://raw.github.com/okfn/messytables/master/horror/simple.xls'
      })
      .end(function(err, res) {
        // unfortunately error won't fire as we'll just attempt to read this as csv
        if (err) return done(err);
        done();
      });
  });
});
