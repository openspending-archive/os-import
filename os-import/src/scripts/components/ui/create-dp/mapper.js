require('backbone-base');
var _ = require('lodash');
var backbone = require('backbone');
var UserDataView = require('./user-data');

module.exports = backbone.BaseView.extend({
  activate: function(state) {
    if((_.isUndefined(state) || state) && _.isEmpty(this.layout))
      this.render();

    this.layout.userData.activate(state);
    return this;
  },

  render: function() {
    this.$el.html(this.template());

    this.layout.userData = new UserDataView({
      el: this.$('[data-id="user-data"]')
    });

    return this;
  },

  reset: function(data) { return this; },
  template: window.TEMPLATES['create-dp/mapper.hbs']
});
