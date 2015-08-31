var
  _ = require('lodash'),
  backbone = require('backbone'),

  /* eslint-disable no-unused-vars */
  backboneBase = require('backbone-base');

  /* eslint-enable no-unused-vars */
  FormView = require('./form'),
  HeaderView = require('./header');

module.exports = backbone.BaseView.extend({
  activate: function(state) {
    if((_.isUndefined(state) || state) && _.isEmpty(this.layout))
      this.render();

    _.invoke(_.values(this.layout), 'activate', state);
    return this;
  },

  render: function() {
    this.layout.form = (new FormView({el: window.APP.$('#create-dp-form')})).render();
    this.layout.header = (new HeaderView({el: window.APP.$('#create-dp-header')})).render();
    return this;
  }
});