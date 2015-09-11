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
      console.log(this.parent.getDatapackage());
    }
  },

  getAmount: function() {
    return this.getMapped('mapping.measures.amount');
  },

  getClassification: function() { return {
    id: this.getMapped('mapping.classification.properties.id'),
    label: this.getMapped('mapping.classification.properties.label')
  }; },

  getDateTime: function() {
    return this.getMapped('mapping.date.properties.year');
  },

  getEntity: function() { return {
    id: this.getMapped('mapping.entity.properties.id'),
    label: this.getMapped('mapping.entity.properties.label')
  }; },

  // Returns form of a column which maps into logical entity <value>
  getMapped: function(value) {
    var valueForm = _.find(this.layout.forms, function(form) {
      return form.getValue().concept === value;
    });

    if(valueForm)
      return valueForm.getValue();

    return null;
  },

  initialize: function(options) {
    backbone.BaseView.prototype.initialize.call(this, options);
    this.layout.forms = [];
  },

  // Check up if required mappings are done
  isComplete: function() {
    var hasAmount;
    var hasDateTime;

    _.each(this.layout.forms, function(form) {
      if(form.getValue().concept === 'mapping.measures.amount')
        hasAmount = true;

      if(form.getValue().concept === 'mapping.date.properties.year')
        hasDateTime = true;
    });

    return hasAmount && hasDateTime;
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
    }, this);

    this.layout.forms = [];
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

    _.each(this.layout.forms, function(form) {
      form.on('concept:change', function(thisForm) {
        // When any form changed enable Next button if there are Amount and
        // Date/Time mappings
        this.$('[data-id="submit-button"]')
          .toggleClass('form-button--disabled', !this.isComplete());

        // Do not allow more one than concept of each type
        _.each(this.layout.forms, function(otherForm) {
          if(
            otherForm.getValue().concept === thisForm.getValue().concept &&
            otherForm.cid !== thisForm.cid
          )
            otherForm.setValue('concept', '');
        });
      }, this);
    }, this);

    return this;
  },

  template: window.TEMPLATES['create-dp/mapper.hbs']
});
