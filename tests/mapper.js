var $ = require('jquery');
var _ = require('underscore');
var assert = require('chai').assert;
var Browser = require('zombie');
var browser;
var csv = require('csv');
var path = require('path');
var dataDir = path.join('.', 'tests', 'data');
var fs = require('fs');
var Promise = require('bluebird');
var request = require('superagent-bluebird-promise');
var setTimeoutOrig = setTimeout;
var sinon = require('sinon');

process.env.NODE_ENV = 'test';
Browser.localhost('127.0.0.1', process.env.PORT || 3000);
browser = new Browser({maxWait: 30000, silent: true});

describe('Manual mapping of types', function() {
  it('mark active step in sub header', function(done) {});
  it('shows header and first two rows of user data', function(done) {});
  it('shows a form of certain properties for each column', function(done) {});

  it(
    'requires to map at least an Amount and a Date/Time in order' +
    'to proceed to the next step', function(done) {}
  );

  it('doesn\'t allow to pick more than one Amount or Date/Time', function(done) {});
  it('properly maps columns into concepts', function(done) {});
  it('properly defines columns types', function(done) {});
});