var
  $ = require('jquery'),
  _ = require('underscore'),
  app = require('../os-import/app'),
  assert = require('chai').assert,
  Browser = require('zombie');

var
  browser,

  SUBMIT_LABELS = {
    default: 'Waiting for files'
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

  it('is alive', function(done) {
    browser.visit('/create', function() {
      browser.assert.success();
      done();
    });
  });

  it('updates URL instantly with slugged name when it changes', function(done) {
    browser.visit('/create', function() {
      browser.fill('[data-editors=name] input[name=name]', 'This is the name');
      browser.fire('[data-editors=name] input[name=name]', 'keyup');

      setTimeout(function() {
        browser.assert.text('[data-editors=name] [data-id=slug]', 'this-is-the-name');
        done();
      }, 1000);
    });
  });

  it('has disabled submit button with default label reading "' + SUBMIT_LABELS.default + '"', function(done) {
    assert(false);
  });

  it('switches submit button into loading state when uploading a file/URL', function(done) {
    assert(false);
  });

  it('uploads and validates valid CSV from local file', function(done) {
    assert(false);
  });

  it('uploads and validates malformed CSV from local file', function(done) {
    assert(false);
  });

  it('uploads and validates valid CSV from URL', function(done) {
    assert(false);
  });

  it('uploads and validates malformed CSV from URL', function(done) {
    assert(false);
  });

  it('allows passing to the next step when there is file and it is valid', function(done) {
    assert(false);
  });

  it('disallows passing to the next step when there is no file or it is invalid', function(done) {
    assert(false);
  });
});
