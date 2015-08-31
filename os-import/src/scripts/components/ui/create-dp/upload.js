var
  backbone = require('backbone'),

  /* eslint-disable no-unused-vars */
  backboneBase = require('backbone-base');

/* eslint-enable no-unused-vars */
module.exports = backbone.BaseView.extend({
  render: function() {
    this.$el.html(this.template({}));
    return this;
  },

  template: window.TEMPLATES['create-dp/upload.hbs']
});