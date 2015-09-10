var $ = require('jquery');
var _ = require('underscore');
var assert = require('chai').assert;
var Browser = require('zombie');
var browser;
var csv = require('csv');
var path = require('path');
var dataDir = path.join('.', 'tests', 'data');
var fs = require('fs');
var jtsInfer = require('json-table-schema').infer;
var parsedData;
var Promise = require('bluebird');
var request = require('superagent-bluebird-promise');
var setTimeoutOrig = setTimeout;
var sinon = require('sinon');

process.env.NODE_ENV = 'test';
Browser.localhost('127.0.0.1', process.env.PORT || 3000);
browser = new Browser({maxWait: 30000, silent: true});

// Get parsed data to feed to testing methods
before(function(done) {
  fs.readFile(path.join(dataDir, 'decent.csv'), 'utf8', function (error, text) {
    if(error)
      return console.log(error);

    csv.parse(text, function(error, data) {
      parsedData = data;
      parsedSchema = jtsInfer(data[0], _.rest(data));
      done();
    });
  });
});

describe('Columns mapping form', function() {
  it(
    'has a method that returns column mapped into Amount concept',
    function(done) { done(); }
  );

  it(
    'has a method that returns column mapped into Date/Time concept',
    function(done) { done(); }
  );
});

describe('Manual mapping of types', function() {
  this.timeout(25000);

  // Complete first step
  beforeEach(function(done) {
    browser.visit('/create', function() {
      var upload = browser.window.APP.layout.createDp.layout.form.layout.upload;
      browser.fill('[data-editors=name] input[name=name]', 'This is the name');

      sinon.stub(browser.window.FileAPI, 'readAsText', function(file, callback) {
        fs.readFile(path.join(dataDir, 'decent.csv'), 'utf8', function (error, data) {
          if(error)
            return console.log(error);

          callback({type: 'load', target:  {
            lastModified: 1428475571000,
            lastModifiedDate: 'Wed Apr 08 2015 09:46:11 GMT+0300 (MSK)',
            name: 'decent.csv',
            size: 410,
            type: 'text/csv',
            webkitRelativePath: ''
          }, result: data});
        });
      });

      setTimeout = function() { upload.parseCSV(); };

      // csv.parse() for some reasons doesn't work. Don't have time to investigate.
      sinon.stub(upload, 'parseCSV', function() {
        upload.trigger('parse-complete', {
          data  : parsedData,
          id    : 1,
          isURL : false,
          name  : 'decent.csv',
          schema: parsedSchema,
          size  : 230,
          text  : 'CSV'
        });
      });

      upload.on('parse-complete', function() {
        browser.window.APP.$('[data-id=submit]').click();

        // Stubbing methods called by setTimeout is a problem, so setTimeout is replaced
        // somewhere — restore it each time
        setTimeout = setTimeoutOrig;

        done();
      });

      browser.attach('[data-id=upload] [data-id=file]', path.join(dataDir, 'decent.csv'));
    });
  });

  it('mark active step in sub header', function(done) {
    browser.assert.elements('[data-step-id="1"].is-active, [data-step-id="3"].is-active', 0);
    browser.assert.element('[data-step-id="2"].is-active');
    done();
  });

  it('shows header and first two rows of user data', function(done) {
    assert(_.chain(parsedData)
      .slice(0, 3)

      .every(function(row, rIndex) {
        return _.every(row, function(column, cIndex) {
          return column = browser.window.APP.$(
            '[data-id="user-data"] tr:eq(' + rIndex + ') td:eq(' + cIndex + ')'
          ).html()
        });
      })

      .value(),

      'User data table do not correspond to uploaded data'
    );

    done();
  });

  it('shows a form of certain properties for each column', function(done) {});

  it(
    'requires to map at least an Amount and a Date/Time in order' +
    'to proceed to the next step', function(done) {}
  );

  it('doesn\'t allow to pick more than one Amount or Date/Time', function(done) {});
  it('properly maps columns into concepts', function(done) {});
  it('properly defines columns types', function(done) {});
});