require('backbone-base');
var _ = require('lodash');
var backbone = require('backbone');
var config = require('../../../config');
var TabularFileManager = require('../../tabularfilemanager');

module.exports = backbone.BaseView.extend({
  // Append data to the data files list of the Step 1 form
  addFile: function(data) {
    var form = this.parent.layout.form;
    form.setValue('files',(form.getValue().files || []).concat(data));
    return this;
  },

  events: {
    'change [data-id=file]': function(event) {
      this.uploadLocalFile(event.currentTarget.files[0]);
      this.$(event.currentTarget).val('');
    },

    'click [data-id=select-file]': function() {
      this.$('[data-id=file]').trigger('click');
    },

    'keydown [data-id=link]': function(event) {
      var url = this.$('[data-id=link]').val();

      if(event.keyCode !== 13)
        return true;

      this.fileManager.fromURL(url, {maxSize: config.csvMaxSize})
        .then(this.addFile.bind(this));

      this.$('[data-id=link]').val('');
      return false;
    }
  },

  initialize: function(options) {
    backbone.BaseView.prototype.initialize.call(this, options);
    this.fileManager = new TabularFileManager();
  },

  render: function() { this.$el.html(this.template({})); return this; },
  template: window.TEMPLATES['step1/upload.hbs'],

  uploadLocalFile: function(file) {
    // When file uploaded add it to the Step 1 form
    this.fileManager.fromBlob(file, {maxSize: config.csvMaxSize})
      .then(this.addFile.bind(this));

    return this;
  }
});
