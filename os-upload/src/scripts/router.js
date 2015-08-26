var _ = require('underscore');
var backbone = require('backbone');


// Application state changed here
module.exports = backbone.Router.extend({
  routes: {
    '(/)': 'index',
  },

  // Turn off all UI views except navigation bar which is part of base layout
  deactivateAll: function() {
    _.chain(window.APP.layout).values().invoke('deactivate');
    return this;
  },

  index: function() { this.deactivateAll(); }
});