var _ = require('underscore');
var backbone = require('backbone');

function logRoute(msg) {
  console.log('%c' + msg, 'font-weight: bold; font-size: 1.5em;');
}

// Application state changed here
module.exports = backbone.Router.extend({
  routes: {
    'create(/)': 'create',
    'map(/)': 'map',
    '(/)': 'index'
  },

  create: function() {
    logRoute('Create data package');
    this.deactivateAll();
    window.APP.$('#create-dp-form').prop('hidden', false);
    window.APP.layout.createDp.activate().layout.form.activate();
    this.setCreateDpStep(1);
  },

  // Turn off all UI views except navigation bar which is part of base layout
  deactivateAll: function() {
    _.chain(window.APP.layout).values().invoke('deactivate');
    return this;
  },

  index: function() { this.deactivateAll(); },

  map: function() {
    logRoute('Manually map types, measures and dimensions');
    this.deactivateAll();
    window.APP.layout.createDp.activate().layout.mapper.activate();
    this.setCreateDpStep(2);
  },

  setCreateDpStep: function(step) {
    var createDp = window.APP.layout.createDp;
    createDp.activate().layout.header.activate().setStep(step);
  }
});
