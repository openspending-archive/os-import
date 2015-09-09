require('backbone-base');
var _ = require('lodash');
var backbone = require('backbone');
var ColumnFormView = require('./column-form');
var inflect = require('i')();
var UserDataView = require('./user-data');

module.exports = backbone.BaseView.extend({
  activate: function(state) {
    if((_.isUndefined(state) || state) && _.isEmpty(this.layout))
      this.render();

    backbone.BaseView.prototype.activate.call(this, state);
    this.layout.userData.activate(state);
    return this;
  },

  initialize: function(options) {
    backbone.BaseView.prototype.initialize.call(this, options);
    this.layout.forms = [];
  },

  render: function() {
    this.$el.html(this.template());

    // First two rows of user data
    this.layout.userData = new UserDataView({
      el: this.$('[data-id="user-data"]')
    });

    return this;
  },

  reset: function(userDataCollection, fieldsSchema) {
    // Clean up previous state
    _.each(this.layout.forms, function(form, index) {
      form.remove();
      delete(this.layout.forms[index]);
    });

    this.layout.userData.reset(userDataCollection);

    // One column — one form
    _.each(userDataCollection.at(0).get('columns'), function(column, index) {
      var schema = fieldsSchema[index];

      this.$('[data-id=forms]').append(_.last(
        this.layout.forms = this.layout.forms.concat((new ColumnFormView({
          data: _.extend(schema, {title: inflect.titleize(schema.name)})
        })).render())
      ).el);
    }, this);

    return this;
  },

  template: window.TEMPLATES['create-dp/mapper.hbs']
});
