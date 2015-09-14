require('backbone-base');
var backbone = require('backbone');

module.exports = backbone.BaseView.extend({
  render: function() {
    this.$el.html(this.template({}));
    return this;
  },

  // Mark active step
  setStep: function(step) {
    this.$('[data-step-id="' + step + '"]').addClass('is-active')
      .siblings().removeClass('is-active');

    return this;
  },

  template: window.TEMPLATES['create-dp/header.hbs']
});
