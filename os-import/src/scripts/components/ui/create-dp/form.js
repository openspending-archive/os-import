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

    // Do not allow child view (upload widget) to change parent — just catch its events
    this.layout.upload.on('upload-started', function() { this.loading(); this.setMessage('Uploading'); }, this);

    this.layout.upload.on('parse-started', function(percents) { this.setMessage('Parsing'); }, this);
    this.layout.upload.on('validation-started', function(percents) { this.setMessage('Validating'); }, this);

    this.layout.upload.on('parse-complete', function(data) {
      this.loading(false);
      this.fields.files.setValue((this.fields.files.getValue() || []).concat(data));
    }, this);

    // Allow submission if all files are valid
    this.on('change', (function(F, T, E) {
      var
        field = this.fields.files,
        hasErrors = field.editor.hasValidationErrors();

      if(_.isEmpty(field.getValue())) {
        this.setMessage('Waiting for files');
        this.$('[data-id=submit]').toggleClass('form-button--disabled', true);
        return false;
      }

      this.setMessage(hasErrors ? 'Fixes Required' : 'Next');
      this.$('[data-id=submit]').toggleClass('form-button--disabled', hasErrors);
    }).bind(this) );

    return this;
  },

  events: {
    'click [data-id=submit]:not(.form-button--disabled):not(.form-button--loading)': function() {
      this.validate();
      return false;
    },

    'click [data-id=submit].form-button--disabled, [data-id=submit].form-button--loading': function() {
      return false;
    }
  },

  initialize: function(options) {
    backbone.BaseView.prototype.initialize.call(this, options);
    backbone.Form.prototype.initialize.call(this, options);
  },

  loading: function(state) {
    var
      isLoading = _.isUndefined(state) || state;

    this.$('[data-id=submit]').toggleClass('form-button--disabled', !isLoading);
    this.$('[data-id=submit]').toggleClass('form-button--loading', isLoading);
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

  setMessage: function(message) {
    this.$('[data-id=submit-message]').html(message).prop('hidden', !message);
    return this;
  },

  template: window.TEMPLATES['create-dp/form.hbs']
});
