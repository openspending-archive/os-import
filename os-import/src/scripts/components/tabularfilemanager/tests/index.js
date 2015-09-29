var _ = require('lodash');
var assert = require('chai').assert;
var path = require('path');
var csvEncoding = 'utf8';
var csvHost = 'http://example.domain';
var csvPath = '/example.csv';
var csvURL = csvHost + csvPath;
var decentCSV = path.join('.', 'tests', 'data', 'decent.csv');
var diff = require('deep-diff').diff;
var FileManager = require('../');
var fileManager;
var fs = require('fs');
var GTResponses = require('./data/gt-responses.js');
var malformedCSV = path.join('.', 'tests', 'data', 'malformed.csv');
var nock = require('nock');
var url = require('url');
process.env.NODE_ENV = 'test';

describe('Tabular file manager', function() {
  beforeEach(function(done) { fileManager = new FileManager(); done(); });

  it('validates and infers schema of CSV string', function(done) {
    nock('http://goodtables.okfnlabs.org').post('/api/run').reply(
      200,
      GTResponses.success
    );

    fs.readFile(decentCSV, csvEncoding, function (error, text) {
      if(error)
        return console.log(error);

      fileManager.parse({
        content: text,
        name: 'decent.csv',
        size: Buffer.byteLength(text, csvEncoding)
      }).then(function(fileObj) {
        assert(
          !diff(fileObj.data, fileManager.file.data),
          'CSV data not stored in file manage object'
        );

        assert(
          !diff(fileObj.schema, fileManager.file.schema),
          'Schema not stored in file manage object'
        );

        done();
      });
    });
  });

  it('doesn\'t infer schema if goodtables invalidates data', function(done) {
    nock('http://goodtables.okfnlabs.org').post('/api/run').reply(
      200,
      GTResponses.fail
    );

    fs.readFile(malformedCSV, csvEncoding, function (error, text) {
      if(error)
        return console.log(error);

      fileManager.parse({
        content: text,
        name: 'malformed.csv',
        size: Buffer.byteLength(text, csvEncoding)
      }).then(function(fileObj) {
        assert(!fileObj.schema, 'There is schema infered');
        done();
      });
    });
  });

  it('can download CSV from URL', function(done) {
    nock('http://goodtables.okfnlabs.org').post('/api/run').reply(
      200,
      GTResponses.success
    );

    fs.readFile(decentCSV, csvEncoding, function (error, text) {
      if(error)
        return console.log(error);

      nock(csvHost).get(csvPath).reply(200, text);

      fileManager.fromURL(csvURL).then(function(file) {
        assert(
          csvURL === file.name,
          'Returned file name doesn\'t correspond to the passed URL'
        );

        assert(
          text.split('\n').length === file.data.length,
          'Returned data size doesn\'t correspond to the passed CSV file size'
        );

        done();
      });
    });
  });

  it(
    'download only first maxSize bytes of CSV if options.maxSize passed',

    function(done) {
      nock('http://goodtables.okfnlabs.org').post('/api/run').reply(
        200,
        GTResponses.success
      );

      fs.readFile(decentCSV, csvEncoding, function (error, text) {
        // Set size so that just first line of CSV fits
        var maxSize = Buffer.byteLength(text.split('\n')[0], csvEncoding) + 1;

        if(error)
          return console.log(error);

        nock(csvHost).get(csvPath).reply(200, text);

        fileManager.fromURL(csvURL, {maxSize: maxSize}).then(function(file) {
          var actualSize = Buffer.byteLength(file.text, csvEncoding)

          assert(
            // Tabular file manager cuts out last line of csv, to have only complete lines
            actualSize === maxSize - 1,

            'Downloaded size is ' + actualSize + ' bytes when it should be '
            + maxSize + ' bytes'
          );

          done();
        });
      });
    }
  );

  it(
    'fires events at each step and returns data in final event',

    function(done) {
      var parseCompleteFired;
      var parseReturnsObject;
      var parseStartFired;
      var validationFired;
      var uploadFired;

      nock('http://goodtables.okfnlabs.org').post('/api/run').reply(
        200,
        GTResponses.success
      );

      fs.readFile(decentCSV, csvEncoding, function (error, text) {
        if(error)
          return console.log(error);

        nock(csvHost).get(csvPath).reply(200, text);

        fileManager.on('parse-complete', function(file) {
          parseCompletetFired = true;
          parseReturnsObject = _.isObject(file);
        });

        fileManager.on('parse-started', function() { parseStartFired = true; });

        fileManager.on('validation-started', function() {
          validationFired = true;
        });

        fileManager.on('upload-started', function() { uploadFired = true; });

        fileManager.fromURL(csvURL).then(function() {
          assert(parseStartFired, 'Parse starting event didn\'t fire');
          assert(validationFired, 'Validation starting event didn\'t fire');
          assert(uploadFired, 'Upload starting event didn\'t fire');

          assert(
            parseReturnsObject,
            'parse-complete event didn\'t return an object'
          );

          done();
        });
      });
    }
  );

  it(
    'has noValidation option to skip validation',

    function(done) {
      var GTRequest = nock('http://goodtables.okfnlabs.org').post('/api/run').reply(
        200,
        GTResponses.success
      );

      fileManager = new FileManager({noValidation: true});

      fs.readFile(decentCSV, csvEncoding, function (error, text) {
        if(error)
          return console.log(error);

        fileManager.parse({
          content: text,
          name: 'decent.csv',
          size: Buffer.byteLength(text, csvEncoding)
        }, fileManager.options).then(function(fileObj) {
          assert(
            !GTRequest.isDone(),
            'Good tables validation API was requested'
          );

          assert(
            !fileManager.file.parseError,
            '.file.parseError should be empty'
          );

          done();
        });
      });
    }
  );
});
