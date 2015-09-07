require('backbone-base');
var _ = require('lodash');
var backbone = require('backbone');
var FormView = require('./form');
var HeaderView = require('./header');

module.exports = backbone.BaseView.extend({
  activate: function(state) {
    if((_.isUndefined(state) || state) && _.isEmpty(this.layout))
      this.render();

    _.invoke(_.values(this.layout), 'activate', state);
    return this;
  },

  render: function() {
    this.layout.form = (new FormView()).render();

    this.layout.header = (new HeaderView({
      el: window.APP.$('#create-dp-header')
    })).render();

    window.APP.$('#create-dp-form').append(this.layout.form.el);
    return this;
  }
});
