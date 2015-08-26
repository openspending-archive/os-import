var
  $ = require('jquery'),
  _ = require('underscore'),
  Browser = require('zombie'),
  app = require('../os-upload/app'),
  assert = require('chai').assert;

process.env.NODE_ENV = 'test';
Browser.localhost('127.0.0.1', process.env.PORT || 3000);

before(function(done) {
  // Run the server
  app.listen(3000, function() { done(); });
});

describe('Core', function() {
  var
    browser = new Browser({maxWait: 30000});

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
