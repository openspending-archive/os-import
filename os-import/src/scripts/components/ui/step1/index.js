require('backbone-base');
var _ = require('lodash');
var backbone = require('backbone');
var DataFilesFormView = require('../../forms/data-files-form');
var UploadView = require('./upload');
var ValidationReportView = require('./validation-report');

module.exports = backbone.BaseView.extend({
  activate: function(state) {
    var isActivating = _.isUndefined(state) || state;
    backbone.BaseView.prototype.activate.call(this, state);

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
      this.parent.loading(false);
      this.setValue('files', (this.getValue().files || []).concat(data));
    }, this.layout.form);

    // Allow submission if there are files and all files are valid
    this.layout.form.on('change', (function() {
      var field = this.layout.form.fields.files;
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
      if(!_.isEmpty(this.layout.form.validate()))
        return false;
      
      window.APP.datapackage.setTitle(this.layout.form.getValue().name);
      window.ROUTER.navigate('/map', {trigger: true});
      return false;
    },

    'click [data-id=submit].form-button--disabled, [data-id=submit].form-button--loading': function() {
      return false;
    }
  },

  /*eslint-enable max-len*/
  loading: function(state) {
    var isLoading = _.isUndefined(state) || state;
    this.$('[data-id=submit]').toggleClass('form-button--disabled', !isLoading);
    this.$('[data-id=submit]').toggleClass('form-button--loading', isLoading);
    return this;
  },

  render: function() {
    this.$el.html(this.template());
    this.layout.form = (new DataFilesFormView({parent: this})).render();

    this.layout.upload = (new UploadView({
      el: this.$('[data-id=upload]'),
      parent: this
    })).render();

    this.layout.validationReport = (new ValidationReportView({
      container: '[data-id=content]',
      el: this.$('[data-id="validation-report"]')
    })).render();

    this.$('[data-id=form]').prepend(this.layout.form.el);
    return this;
  },

  setMessage: function(message) {
    this.$('[data-id=submit-message]').html(message).prop('hidden', !message);
    return this;
  },

  template: window.TEMPLATES['step1/index.hbs']
});
