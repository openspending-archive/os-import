require('backbone-base');
var backbone = require('backbone');

module.exports = backbone.BaseView.extend({
  render: function() {
    this.$el.html(this.template({}));
    return this;
  },

  template: window.TEMPLATES['create-dp/header.hbs']
});
