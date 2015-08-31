var
  backbone = require('backbone'),

  /* eslint-disable no-unused-vars */
  backboneBase = require('backbone-base'),

  /* eslint-enable no-unused-vars */
  UploadView = require('./upload');

module.exports = backbone.BaseView.extend({
  render: function() {
    this.$el.html(this.template({}));
    this.layout.upload = (new UploadView({el: this.$('[data-id=upload]'), parent: this})).render();
    return this;
  },

  template: window.TEMPLATES['create-dp/form.hbs']
});