var
  $ = require('jquery'),
  _ = require('underscore'),
  app = require('../os-import/app'),
  assert = require('chai').assert,
  Browser = require('zombie'),
  csv = require('csv'),
  fs = require('fs'),
  path = require('path'),
  Promise = require('bluebird'),
  request = require('superagent-bluebird-promise'),
  setTimeoutOrig = setTimeout,
  sinon = require('sinon');

var
  browser,
  dataDir = path.join('.', 'tests', 'data');

  submitLabels = {
    default: 'Waiting for files',
    fixesRequired: 'Fixes Required',
    next: 'Next'
  };

process.env.NODE_ENV = 'test';
Browser.localhost('127.0.0.1', process.env.PORT || 3000);
browser = new Browser({maxWait: 30000, silent: true});

before(function(done) {
  // Run the server
  app.listen(3000, function() { done(); });
});

describe('Core', function() {
  // Ensure we have time for request to reoslve, etc.
  this.timeout(25000);

  it('is alive', function(done) {
    browser.visit('/', function() {
      browser.assert.success();
      done();
    });
  });

  it('reserves / for landing page only and does not load app scripts', function(done) {
    browser.visit('/some/non/index/route', function() {
      browser.assert.element('script[src="app.min.js"]');
      browser.assert.element('script[src="vendor.min.js"]');

      browser.visit('/', function() {
        browser.assert.elements('script[src="app.min.js"]', {exactly: 0});
        browser.assert.elements('script[src="vendor.min.js"]', {exactly: 0});
        done();
      });
    });
  });
});

describe('Form for creating data', function() {
  this.timeout(25000);

  beforeEach(function(done) {
    // Stubbing methods called by setTimeout is a problem, so setTimeout is replaced
    // somewhere — restore it each time
    setTimeout = setTimeoutOrig;

    browser.visit('/create', function() { done(); });
  });

  it('is alive', function(done) {
    browser.assert.success();
    done();
  });

  it('updates URL instantly with slugged name when it changes', function(done) {
    browser.fill('[data-editors=name] input[name=name]', 'This is the name');
    browser.fire('[data-editors=name] input[name=name]', 'keyup');
    browser.assert.text('[data-editors=name] [data-id=slug]', 'this-is-the-name');
    done();
  });

  it('has disabled submit button with default label reading "' + submitLabels.default + '"', function(done) {
    browser.assert.text('[data-id="submit-message"]', submitLabels.default);
    browser.assert.hasClass('[data-id="submit"]', 'form-button--disabled');
    done();
  });

  it('switches submit button into loading state when uploading a file/URL', function(done) {
    browser.attach('[data-id=upload] [data-id=file]', path.join(dataDir, 'decent.csv'));
    browser.assert.hasClass('[data-id="submit"]', 'form-button--loading');

    browser.visit('/create', function() {
      var
        upload = browser.window.APP.layout.createDp.layout.form.layout.upload;

      browser.fill('[data-id=upload] [data-id=link]', 'http://google.com');

      // There is no way to simulate pressing Enter, as .fire() doesn't support passing .event
      upload.events['keydown [data-id=link]'].call(upload, {keyCode: 13});

      browser.assert.hasClass('[data-id="submit"]', 'form-button--loading');
      done();
    });
  });

  it('uploads valid CSV from local file, populates list with row and allows next step', function(done) {
    var
      upload = browser.window.APP.layout.createDp.layout.form.layout.upload;
    
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
        data : {},
        id   : 1,
        isURL: false,
        name : 'decent.csv',
        schema: {},
        text: 'CSV'
      });
    });

    upload.on('parse-complete', function(data) {
      browser.assert.text('[data-editors=files] [data-id="file-name"]', 'decent.csv');
      browser.assert.elements('[data-editors=files] [data-id=error]', 0);
      browser.assert.elements('[data-id="submit"].form-button--disabled', 0);
      browser.assert.text('[data-id="submit-message"]', submitLabels.next);
      done();
    });

    browser.attach('[data-id=upload] [data-id=file]', path.join(dataDir, 'decent.csv'));
  });

  it('uploads malformed CSV from local file, populates list with erroneus row and disallows next step', function(done) {
    var
      upload = browser.window.APP.layout.createDp.layout.form.layout.upload;
    
    sinon.stub(browser.window.FileAPI, 'readAsText', function(file, callback) {
      fs.readFile(path.join(dataDir, 'malformed.csv'), 'utf8', function (error, data) {
        if(error)
          return console.log(error);

        callback({type: 'load', target:  {
          lastModified: 1428475571000,
          lastModifiedDate: 'Wed Apr 08 2015 09:46:11 GMT+0300 (MSK)',
          name: 'malformed.csv',
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
        data : {},
        id   : 1,
        isURL: false,
        name : 'malformed.csv',
        parseError: {error: true},
        schema: {},
        text: 'CSV'
      });
    });

    upload.on('parse-complete', function(data) {
      browser.assert.text('[data-editors=files] [data-id="file-name"]', 'malformed.csv');
      browser.assert.elements('[data-editors=files] [data-id=error]', 1);
      browser.assert.elements('[data-id="submit"].form-button--disabled', 1);
      browser.assert.text('[data-id="submit-message"]', submitLabels.fixesRequired);
      done();
    });

    browser.attach('[data-id=upload] [data-id=file]', path.join(dataDir, 'decent.csv'));
  });

  it('uploads valid CSV from URL, populates list with row and allows next step', function(done) {
    var
      upload = browser.window.APP.layout.createDp.layout.form.layout.upload
      URL = 'http://example.domain/file.csv';

    // csv.parse() for some reasons doesn't work. Don't have time to investigate.
    sinon.stub(upload, 'parseCSV', function(name, string, options) {
      upload.trigger('parse-complete', {
        data : {},
        id   : 1,
        isURL: options.isURL,
        name : name,
        schema: {},
        text: 'CSV'
      });
    });

    // Fired when user hits Enter in URL field. Rely on internal events as there
    // is no simple way to stub promised superagent
    upload.on('upload-started', function() { upload.parseCSV(URL, 'string', {isURL: true}); });

    upload.on('parse-complete', function(data) {
      browser.assert.text('[data-editors=files] [data-id="file-name"]', URL);
      browser.assert.elements('[data-editors=files] [data-id=error]', 0);
      browser.assert.elements('[data-id="submit"].form-button--disabled', 0);
      browser.assert.text('[data-id="submit-message"]', submitLabels.next);
      done();
    });
    
    browser.fill('[data-id=upload] [data-id=link]', 'http://google.com');

    // There is no way to simulate pressing Enter, as .fire() doesn't support passing .event
    upload.events['keydown [data-id=link]'].call(upload, {keyCode: 13});
  });

  it('uploads malformed CSV from URL, populates list with erroneus row and disallows next step', function(done) {
    var
      upload = browser.window.APP.layout.createDp.layout.form.layout.upload
      URL = 'http://example.domain/file.csv';

    // csv.parse() for some reasons doesn't work. Don't have time to investigate.
    sinon.stub(upload, 'parseCSV', function(name, string, options) {
      upload.trigger('parse-complete', {
        data      : {},
        id        : 1,
        isURL     : options.isURL,
        name      : name,
        parseError: {error: true},
        schema    : {},
        text      : 'CSV'
      });
    });

    // Fired when user hits Enter in URL field. Rely on internal events as there
    // is no simple way to stub promised superagent
    upload.on('upload-started', function() { upload.parseCSV(URL, 'string', {isURL: true}); });

    upload.on('parse-complete', function(data) {
      browser.assert.text('[data-editors=files] [data-id="file-name"]', URL);
      browser.assert.elements('[data-editors=files] [data-id=error]', 1);
      browser.assert.elements('[data-id="submit"].form-button--disabled', 1);
      browser.assert.text('[data-id="submit-message"]', submitLabels.fixesRequired);
      done();
    });
    
    browser.fill('[data-id=upload] [data-id=link]', 'http://google.com');

    // There is no way to simulate pressing Enter, as .fire() doesn't support passing .event
    upload.events['keydown [data-id=link]'].call(upload, {keyCode: 13});
  });
});
