require('backbone-base');
var _ = require('lodash');
var backbone = require('backbone');
var DataFilesFormView = require('./data-files-form');
var HeaderView = require('./header');
var MapperView = require('./mapper');
var slug = require('slug');

module.exports = backbone.BaseView.extend({
  activate: function(state) {
    if((_.isUndefined(state) || state) && _.isEmpty(this.layout))
      this.render();

    this.layout.header.activate(state);
    return this;
  },

  deactivate: function() {
    _.invoke(_.values(this.layout), 'activate', false);
    return this;
  },

  getDatapackage: function() {
    var value = this.layout.form.getValue();

    return JSON.parse(window.TEMPLATES['datapackage.hbs']({
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
    }));
  },

  render: function() {
    this.layout.form = (new DataFilesFormView()).render();

    this.layout.header = (new HeaderView({
      el: window.APP.$('#create-dp-header')
    })).render();

    this.layout.mapper = (new MapperView({
      el: window.APP.$('#create-dp-map')
    })).render().deactivate();

    window.APP.$('#create-dp-form').append(this.layout.form.el);
    return this;
  }
});
