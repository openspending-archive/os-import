var $ = require('jquery');
var _ = require('underscore');
var Browser = require('zombie');
var app = require('../os-upload/app');
var assert = require('chai').assert;

process.env.NODE_ENV = 'test';

Browser.localhost('127.0.0.1', 3000);

describe('Core', function() { });
