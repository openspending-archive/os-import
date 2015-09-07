var _ = require('underscore');
var backbone = require('backbone');

function logRoute(msg) {
  console.log('%c' + msg, 'font-weight: bold; font-size: 1.5em;');
}

// Application state changed here
module.exports = backbone.Router.extend({
  routes: {
    'create(/)': 'create',
    '(/)': 'index'
  },

  create: function() {
    logRoute('Create data package');
    this.deactivateAll();
    window.APP.layout.createDp.activate();
  },

  // Turn off all UI views except navigation bar which is part of base layout
  deactivateAll: function() {
    _.chain(window.APP.layout).values().invoke('deactivate');
    return this;
  },

  index: function() { this.deactivateAll(); }
});
