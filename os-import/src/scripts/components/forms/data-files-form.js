require('backbone-base');
require('backbone-forms');
var _ = require('lodash');
var backbone = require('backbone');
var DataFilesEditor = require('./data-files-editor');
var NameEditor = require('./name-editor');

module.exports = backbone.BaseView.extend(backbone.Form.prototype).extend({
  initialize: function(options) {
    backbone.BaseView.prototype.initialize.call(this, options);
    backbone.Form.prototype.initialize.call(this, options);
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
          .layout.step1
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
          .layout.step1
            .layout.upload.uploadLocalFile(file);
      }
    }
  },

  template: window.TEMPLATES['forms/data-files-form.hbs']
});
