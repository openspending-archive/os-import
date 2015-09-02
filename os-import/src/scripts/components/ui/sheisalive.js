// http://www.youtube.com/watch?v=OiBtx18jc4Q
require('backbone-base');

var
  _ = require('lodash'),
  backbone = require('backbone'),
  CreateDpView = require('./create-dp');

module.exports = backbone.BaseView.extend({
  activateOverlay: function(state) {
    this.$('#modal-overlay').prop('hidden', !(_.isUndefined(state) || state));
    return this;
  },

  events: {
    // Share the click between all views
    'click': function(event) { this.trigger('click', event.target); }
  },

  render: function() {
    this.layout.createDp = new CreateDpView();
    return this;
  }
});
