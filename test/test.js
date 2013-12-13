var fs = require('fs')
    path = require('path')
  , request = require('supertest')
  , express = require('express')
  , assert = require('assert')
  , config = require('../lib/config.js')
  , datastore = require('../lib/datastore.js')
  ;

if (config.apikey === null || typeof config.apikey === 'undefined') {
  throw "ERROR: You must set the APIKEY environment variable to a valid " +
        "OpenSpending API key when testing!\n";
}

var app = require('../app.js').app;

var localBucket = config.s3.bucket;

describe('API', function() {
  it('Upload', function(done) {
    request(app)
      .post('/')
      .field('dataset', 'abc')
      .attach('datafile', 'test/data/sample1.csv')
      .end(function(err, res) {
        assert.equal(res.statusCode, 200);
        var fp = path.join(localBucket, 'datasets', 'abc', 'data', 'sample1.csv');
        assert(fs.existsSync(fp), 'File not saved to expected location ' + fp);
        done();
      });
  });

  it('authorizedToUpload', function(done) {
    datastore.authorizedToUpload(config.apikey, 'a-dataset-that-does-not-exist', function(err, ok) {
      assert(ok);
      done(err);
    });
  });

  it('not authorizedToUpload', function(done) {
    datastore.authorizedToUpload('a bad api key', 'a-dataset-that-does-not-exist', function(err, ok) {
      assert(!ok);
      done(err);
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
