require('backbone-base');
require('backbone-forms');
var _ = require('lodash');
var backbone = require('backbone');

module.exports = backbone.Form.extend({
  schema: {
    concept: {
      options: [
        {label: '', val: ''},
        {label: 'Amount', val: 'mapping.measures.amount'},
        {label: 'Date/Time', val: 'mapping.date.properties.year'},
        {label: 'Classification', val: 'mapping.classification.properties.id'},

        {
          label: 'Classification > ID',
          val: 'mapping.classification.properties.id'
        },

        {
          label: 'Classification > Label',
          val: 'mapping.classification.properties.label'
        },

        {label: 'Entity', val: 'mapping.entity.properties.id'},
        {label: 'Entity > ID', val: 'mapping.entity.properties.id'},
        {label: 'Entity > Label', val: 'mapping.entity.properties.label'}
      ],

      type: 'Select'
    },

    description: {type: 'TextArea'},
    name: {},

    type: {
      options: [
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
        {label: 'Any', val: 'any'}
      ],

      type: 'Select'
    },

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
