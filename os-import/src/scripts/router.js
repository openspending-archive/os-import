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
    this.deactivateAll();
    window.APP.layout.createDp.activate().layout.form.activate();
    this.setCreateDpStep(1);
  },

  // Turn off all UI views except navigation bar which is part of base layout
  deactivateAll: function() {
    _.chain(window.APP.layout).values().invoke('deactivate').value();
    return this;
  },

  index: function() { this.deactivateAll(); },

  map: function() {
    var createDp;
    var fields;
    var mapperFields;
    var mapper;
    logRoute('Manually map types, measures and dimensions');
    this.deactivateAll();
    createDp = window.APP.layout.createDp.activate();
    mapper = createDp.layout.mapper;

    if(_.isEmpty(createDp.layout.form.getValue().files)) {
      createDp.activateEmptyState(true);
      return false;
    }

    fields = _.first(createDp.getDatapackage().resources).schema.fields;
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
          _.chain(_.first(createDp.layout.form.getValue().files).data)
            .slice(0, 3)
            .map(function(row) { return {columns: row}; })
            .value()
        ),

        fields
      );

    mapper.activate();
    this.setCreateDpStep(2);
  },

  setCreateDpStep: function(step) {
    var createDp = window.APP.layout.createDp;
    createDp.activate().layout.header.activate().setStep(step);
  }
});
