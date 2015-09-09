require('backbone-base');
require('backbone-forms');
var _ = require('lodash');
var backbone = require('backbone');
var DataFilesEditor = require('./data-files-editor');
var NameEditor = require('./name-editor');
var UploadView = require('./upload');
var ValidationReportView = require('./validation-report');

module.exports = backbone.BaseView.extend(backbone.Form.prototype).extend({
  activate: function(state) {
    var isActivating = _.isUndefined(state) || state;
    backbone.BaseView.prototype.activate.call(this, state);
    window.APP.$('#create-dp-form').prop('hidden', !(_.isUndefined(state) || state));

    if(isActivating && _.isEmpty(this.layout))
      this.render();

    this.layout.upload.off(null, null, this);
    this.off(null, null, this);

    if(!isActivating)
      return this;

    // Do not allow child view (upload widget) to change parent — just catch its events
    this.layout.upload.on('upload-started', function() {
      this.loading(); this.setMessage('Uploading');
    }, this);

    this.layout.upload.on('parse-started', function() {
      this.setMessage('Parsing');
    }, this);

    this.layout.upload.on('validation-started', function() {
      this.setMessage('Validating');
    }, this);

    this.layout.upload.on('parse-complete', function(data) {
      this.loading(false);

      this.fields.files.setValue(
        (this.fields.files.getValue() || []).concat(data)
      );
    }, this);

    // Allow submission if there are files and all files are valid
    this.on('change', (function() {
      var field = this.fields.files;
      var hasErrors = field.editor.hasValidationErrors();

      // Allow just single upload
      this.layout.upload.activate(_.isEmpty(field.getValue()));

      if(_.isEmpty(field.getValue())) {
        this.setMessage('Waiting for files');
        this.$('[data-id=submit]').toggleClass('form-button--disabled', true);
        return false;
      }

      this.setMessage(hasErrors ? 'Fixes Required' : 'Next');

      this.$('[data-id=submit]')
        .toggleClass('form-button--disabled', hasErrors);
    }).bind(this));

    return this;
  },

  /*eslint-disable max-len*/
  events: {
    'click [data-id=submit]:not(.form-button--disabled):not(.form-button--loading)': function() {
      if(_.isEmpty(this.validate()))
        window.ROUTER.navigate('/map', {trigger: true});

      return false;
    },

    'click [data-id=submit].form-button--disabled, [data-id=submit].form-button--loading': function() {
      return false;
    }
  },

  /*eslint-enable max-len*/
  initialize: function(options) {
    backbone.BaseView.prototype.initialize.call(this, options);
    backbone.Form.prototype.initialize.call(this, options);
  },

  loading: function(state) {
    var isLoading = _.isUndefined(state) || state;
    this.$('[data-id=submit]').toggleClass('form-button--disabled', !isLoading);
    this.$('[data-id=submit]').toggleClass('form-button--loading', isLoading);
    return this;
  },

  render: function() {
    backbone.Form.prototype.render.call(this);

    this.layout.upload = (new UploadView({
      el: this.$('[data-id=upload]'),
      parent: this
    })).render();

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

      validators: [{
        type: 'required',
        message: 'Your data package should have a name'
      }],

      urlBase: 'https://openspending.org/'
    },

    files: {
      reporter: function(errors) {
        // Incapsulate editor errors reporting routine in param to ensure generic use
        window.APP
          .layout.createDp
            .layout.form
              .layout.validationReport.reset(errors).activate();
      },

      type: DataFilesEditor,

      validators: [{
        message: 'You need to upload at least one data file',
        type: 'required'
      }],

      // Same for uploader — ensure generic use
      uploader: function(file) {
        window.APP
          .layout.createDp
            .layout.form
              .layout.upload.uploadLocalFile(file);
      }
    }
  },

  setMessage: function(message) {
    this.$('[data-id=submit-message]').html(message).prop('hidden', !message);
    return this;
  },

  template: window.TEMPLATES['create-dp/data-files-form.hbs']
});
