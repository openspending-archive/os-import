var _ = require('lodash');
var EventEmitter = require('events');
var GoodTables = require('goodtables');

var TabularFileManager = function() {
  EventEmitter.call(this);
	this.goodTables = new GoodTables({method: 'post', report_type: 'grouped'});
  return this;
};

_.extend(TabularFileManager.prototype, EventEmitter.prototype, {
  // Read data from File object
  fromBlob: require('./from-blob'),

  // TODO To be implemented
  fromFile: function() {},

  // Read data directly from URL
  fromURL: require('./from-url'),

  // Get CSV schema and validate text over good tables
  parse: require('./parse')
});

module.exports = TabularFileManager;
