var _ = require('lodash');
var EventEmitter = require('events');
var GoodTables = require('goodtables');

var TabularFileManager = function(options) {
  this.options = options;
  EventEmitter.call(this);
	this.goodTables = new GoodTables({method: 'post', report_type: 'grouped'});
  return this;
};

_.extend(TabularFileManager.prototype, EventEmitter.prototype, {
  // Decide which loader to use and get the data
  addFile: require('./add-file'),

  // Get CSV schema and validate text over good tables
  parse: require('./parse')
});

module.exports = TabularFileManager;
