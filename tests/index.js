var $ = require('jquery');
var _ = require('underscore');
var app = require('../os-import/app');
var assert = require('chai').assert;
var Browser = require('zombie');
var browser;
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

require('./step1');
require('./step2');
require('../os-import/src/scripts/components/tabularfilemanager/tests');
require('../os-import/src/scripts/components/datapackage/test');
