// http://www.youtube.com/watch?v=OiBtx18jc4Qrequire('backbone-base');
var _ = require('lodash');
var backbone = require('backbone');
var Step1View = require('./step1');
var HeaderView = require('./header');
var MapperView = require('./step2/mapper');
var slug = require('slug');

module.exports = backbone.BaseView.extend({
  activate: function(state) {
    if(_.isEmpty(this.layout))
      this.render();

    this.layout.header.activate(state);

    if(state === false)
      this.activateEmptyState(false);

    return this;
  },

  activateEmptyState: function(state) {
    window.APP.$('#direct-to-step-1').prop('hidden', !state);
    return this;
  },

  activateOverlay: function(state) {
    this.$('#modal-overlay').prop('hidden', !(_.isUndefined(state) || state));
    return this;
  },

  deactivate: function() {
    _.invoke(_.values(this.layout), 'activate', false);
    this.activate(false);
    return this;
  },

  events: {
    /* eslint-disable lines-around-comment*/
    // Share the click between all views
    /* eslint-enable lines-around-comment*/
    'click': function(event) { this.trigger('click', event.target); },

    'click [data-push-state]': function(event) {
      window.ROUTER.navigate(event.currentTarget.attributes.href.nodeValue, {
        trigger: true
      });

      return false;
    }
  },

  // TODO This possible should be separated from UI
  getDatapackage: function() {
    var mapper = this.layout.mapper;
    var value = this.layout.step1.layout.form.getValue();

    return JSON.parse(window.TEMPLATES['datapackage.hbs'](_.extend({
      name: slug(value.name).toLowerCase(),
      title: value.name,

      resources: _.map(value.files, function(file) {
        var filePath = file.isURL ? _.last(file.name.split('/')) : file.name;

        return {
          bytes   : file.size,
          filename: _.initial(filePath.split('.')).join('.'),
          schema  : JSON.stringify(file.schema),
          path    : filePath
        };
      })

    // Mappings
    }, mapper.isComplete() && {
      amountsource: (mapper.getAmount() || {}).name,
      datetimesource: (mapper.getDateTime() || {}).name,

      // Mappings with common patterns
      mappings: [
        {
          idsource: (mapper.getEntity().id || {}).name,
          labelsource: (mapper.getEntity().label || {}).name,
          name: 'entity'
        },

        {
          idsource: (mapper.getClassification().id || {}).name,
          labelsource: (mapper.getClassification().label || {}).name,
          name: 'classification'
        }
      ]
    })));
  },

  render: function() {
    this.layout.step1 = (new Step1View({el: this.$('#step1')})).render();

    this.layout.header = (new HeaderView({
      el: window.APP.$('#create-dp-header')
    })).render();

    this.layout.mapper = (new MapperView({
      el: window.APP.$('#create-dp-map'),
      parent: this
    })).render().deactivate();

    return this;
  }
});
