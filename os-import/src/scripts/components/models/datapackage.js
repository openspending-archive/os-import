require('backbone-nested');
var _ = require('lodash');
var backbone = require('backbone');
var dpinit = require('datapackage-init');
var slug = require('slug');

module.exports = backbone.NestedModel.extend({
  // Add resource(s) to the datapackage. Update list, do not replace.
  addResources: function(resources) {
    var resourcesArr = _.flatten([resources]);
    return this;
  },

  clearResources: function() { return this; },

  initialize: function(options) {
    backbone.NestedModel.prototype.initialize.call(this, options);
    this.set(dpinit.simpleDefaults());
  },

  replaceResources: function(resources) {
    this.clearResources();
    this.addResources(resources);
    return this;
  },

  setTitle: function(title) {
    this.set('title', title);
    this.set('name', slug(title));
    return this;
  }
});
