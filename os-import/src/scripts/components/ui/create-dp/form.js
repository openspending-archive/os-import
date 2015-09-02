require('backbone-base');
require('backbone-forms');

var
  _ = require('lodash'),
  backbone = require('backbone'),
  DataFilesEditor = require('./data-files-editor'),
  NameEditor = require('./name-editor'),
  ValidationReportView = require('./validation-report'),
  UploadView = require('./upload');

module.exports = backbone.BaseView.extend(backbone.Form.prototype).extend({
  activate: function(state) {
    backbone.BaseView.prototype.activate.call(this, state);

    if((_.isUndefined(state) || state) && _.isEmpty(this.layout))
      this.render();

    // Do not allow chuld view (upload widget) to change parent — just catch its events
    this.layout.upload.on('upload-started', this.loading, this);

    this.layout.upload.on('parse-complete', function(csvData) {
      this.fields.files.setValue((this.fields.files.getValue() || []).concat(csvData))
      this.loading(false);
    }, this);

    return this;
  },

  events: {
    'click [data-id=create]': function() { this.validate(); return false; }
  },

  initialize: function(options) {
    backbone.BaseView.prototype.initialize.call(this, options);
    backbone.Form.prototype.initialize.call(this, options);
  },

  loading: function(state) {
    var
      isLoading = _.isUndefined(state) || state;

    this.$('[data-id=submit]').toggleClass('form-button--loading', isLoading);
    this.$('[data-id=upload-in-progress]').prop('hidden', !isLoading);
    this.$('[data-id=create]').prop('hidden', isLoading);
    return this;
  },

  render: function() {
    backbone.Form.prototype.render.call(this);
    this.layout.upload = (new UploadView({el: this.$('[data-id=upload]'), parent: this})).render();

    this.layout.validationReport = (new ValidationReportView({
      container: '[data-id=content]',
      el: this.$('[data-id="validation-report"]')
    })).render();

    return this;
  },

  schema: {
    name: {
      label: 'Name your Data Package',
      type: NameEditor,
      validators: [{type: 'required', message: 'Your data package should have a name'}],
      urlBase: 'https://openspending.org/'
    },

    files: {
      type: DataFilesEditor,
      validators: [{type: 'required', message: 'You need to upload at least one data file'}],

      // Incapsulate editor errors reporting routine in param to ensure generic use
      reporter: function(errors) { window.APP.layout.createDp.layout.form.layout.validationReport.reset(errors).activate(); },

      // Same for uploader — ensure generic use
      uploader: function(file) { window.APP.layout.createDp.layout.form.layout.upload.uploadLocalFile(file); }
    }
  },

  template: window.TEMPLATES['create-dp/form.hbs']
});
