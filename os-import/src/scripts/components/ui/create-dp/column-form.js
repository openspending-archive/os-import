require('backbone-base');
require('backbone-forms');
var _ = require('lodash');
var backbone = require('backbone');

module.exports = backbone.Form.extend({
  schema: {
    concept: {options: [
      {label: 'Amount', title: 'mapping.measures.amount'},
      {label: 'Date/Time', title: 'mapping.date.properties.year'},
      {label: 'Classification', title: 'mapping.classification.properties.id'},
      {label: 'Classification > ID', title: 'mapping.classification.properties.id'},
      {label: 'Classification > Label', title: 'mapping.classification.properties.label'},
      {label: 'Entity', title: 'mapping.entity.properties.id (not an attribute group)'},
      {label: 'Entity > ID', title: 'mapping.entity.properties.id'},
      {label: 'Entity > Label', title: 'mapping.entity.properties.label'}
    ], type: 'Select'},

    description: {type: 'TextArea'},

    type: {options: [
      {label: 'String', val: 'string'},
      {label: 'Integer', val: 'integer'},
      {label: 'Number', val: 'number'},
      {label: 'Boolean', val: 'boolean'},
      {label: 'Null', val: 'null'},
      {label: 'Array', val: 'array'},
      {label: 'Object', val: 'object'},
      {label: 'Date', val: 'date'},
      {label: 'Time', val: 'time'},
      {label: 'Datetime', val: 'datetime'},
      {label: 'Geo point', val: 'geopoint'},
      {label: 'Geo JSON', val: 'geojson'},
      {label: 'Any', val: 'any'},
    ], type: 'Select'},

    title: {validators: ['required']}
  },

  template: window.TEMPLATES['create-dp/column-form.hbs'],

  validate: function() {
    var errors = backbone.Form.prototype.validate.call(this);
    this.$('[data-editors] [data-id=error]').html('');

    _.each(errors, function(V, K) {
      this.$('[data-editors="' + K + '"] [data-id=error]').html(V.message);
    }, this);

    return errors;
  }
});
