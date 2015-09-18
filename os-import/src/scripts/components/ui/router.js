var _ = require('lodash');
var backbone = require('backbone');

function logRoute(msg) {
  console.log('%c' + msg, 'font-weight: bold; font-size: 1.5em;');
}

// Application state changed here
module.exports = backbone.Router.extend({
  routes: {
    'create(/)': 'create',
    'map(/)': 'map',
    '(/)': 'index'
  },

  create: function() {
    logRoute('Create data package');
    window.APP.deactivate();
    window.APP.activate().layout.form.activate();
    this.setStep(1);
  },

  index: function() { window.APP.deactivate(); },

  map: function() {
    var fields;
    var mapperFields;
    var mapper;
    logRoute('Manually map types, measures and dimensions');
    window.APP.deactivate();
    mapper = window.APP.activate().layout.mapper;

    if(_.isEmpty(window.APP.layout.form.getValue().files)) {
      window.APP.activateEmptyState(true);
      return false;
    }

    fields = _.first(window.APP.getDatapackage().resources).schema.fields;
    mapperFields = mapper.getValue();

    // TODO Replace this condition with data package object when design architecture
    // refactoring is done
    if(!(
      mapperFields.length === fields.length

      && _.every(mapperFields, function(field, i) {
        return field.name === fields[i].name && field.type === fields[i].type;
      })
    ))

      // Pass user data and resource fields schemas into mapper view
      mapper.reset(
        new backbone.Collection(
          _.chain(_.first(window.APP.layout.form.getValue().files).data)
            .slice(0, 3)
            .map(function(row) { return {columns: row}; })
            .value()
        ),

        fields
      );

    mapper.activate();
    this.setStep(2);
  },

  setStep: function(step) {
    window.APP.activate().layout.header.activate().setStep(step);
  }
});
