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

  events: {
    'click [data-id="submit-button"]': function() {
      _.invoke(this.layout.forms, 'validate');
    }
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
      form.off(null, null, this);
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

    // When any form changed enable Next button if there are Amount and
    // Date/Time mappings
    _.each(this.layout.forms, function(form) {
      form.on('concept:change', function(value) {
        var hasAmount;
        var hasDateTime;

        _.each(this.layout.forms, function(form) {
          if(form.getValue().concept === 'mapping.measures.amount')
            hasAmount = true;

          if(form.getValue().concept === 'mapping.date.properties.year')
            hasDateTime = true;
        });

        this.$('[data-id="submit-button"]')
          .toggleClass('form-button--disabled', !(hasAmount && hasDateTime));
      }, this);
    }, this);

    return this;
  },

  template: window.TEMPLATES['create-dp/mapper.hbs']
});
