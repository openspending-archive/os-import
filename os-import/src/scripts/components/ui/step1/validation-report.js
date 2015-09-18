require('backbone-base');
var _ = require('lodash');
var backbone = require('backbone');
var BaseModalView = require('../base/modal');

module.exports = backbone.BaseListView.extend(BaseModalView.prototype).extend({
  ItemView: backbone.BaseView.extend({
    attributes: {class: 'result panel panel-default'},

    render: function() {
      this.$el.html(this.template(_.extend(this.model.toJSON(), {
        isheader: this.model.get('row_index') === 0
      })));

      return this;
    },

    template: window.TEMPLATES['create-dp/validation-report-item.hbs']
  }),

  render: function() {
    this.$el.html(this.template(this.errors));
    return this;
  },

  reset: function(errors) {
    this.errors = errors;

    backbone.BaseListView.prototype.reset.call(this, new backbone.Collection(
      _.map(this.errors, function(error) { return _.values(error)[0]; })
    ));

    return this;
  },

  template: window.TEMPLATES['create-dp/validation-report.hbs']
});
