require('backbone-base');

var
  _ = require('lodash'),
  backbone = require('backbone'),
  BaseModalView = require('../base/modal');

module.exports = BaseModalView.extend({
  render: function() { this.$el.html(this.template(this.errors)); return this; },
  reset: function(errors) { this.errors = errors; this.render(); return this; },
  template: window.TEMPLATES['create-dp/validation-report.hbs']
});