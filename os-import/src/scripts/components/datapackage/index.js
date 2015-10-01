var _ = require('lodash');
var dpinit = require('datapackage-init');
var JSONSchema = require('json-table-schema');
var nested = require('nested-property');
var path = require('path');
var slug = require('slug');

var DatapackageModel = function() {
  this.datapackage = dpinit.simpleDefaults();

  // Clear up default name
  this.setTitle('');

  return this;
}

_.extend(DatapackageModel.prototype, {
  /*
  Update list of resources, do not replace.

  @param {array}/{object} resources — resource object or array of objects
  {data: <CSV string>, path: <path>, schema: <schema to use, optional>}
  */
  addResources: function(resources) {
    this.set('resources', (this.get('resources') || []).concat(
      _.chain([resources]).flatten().map(function(resource) {
        return this.createResourceEntry(resource);
      }, this).value()
    ));

    return this;
  },

  clearResources: function(resource) { return this; },

  createResourceEntry: function(resource) { return {
    format: _.last(resource.path.split('.')).toLowerCase(),
    name: _.last(resource.path.split(path.sep)).toLowerCase(),
    path: resource.path,

    schema: resource.schema
      || JSONSchema.infer(resource.data[0], _.rest(resource.data))
  }; },

  get: function(path) { return nested.get(this.datapackage, path); },

  initialize: function(options) {
    nested.prototype.initialize.call(this, options);
    this.set(dpinit.simpleDefaults());
  },

  resetResources: function(resources) {
    this.clearResources();
    this.addResources(resources);
    return this;
  },

  set: function(path, value) {
    nested.set(this.datapackage, path, value);
    return this;
  },

  setTitle: function(title) {
    this.set('title', title);
    this.set('name', slug(title).toLowerCase());
    return this;
  },

  toJSON: function() { return this.datapackage; }
});

module.exports = DatapackageModel;
