require('backbone-base');
var _ = require('lodash');
var backbone = require('backbone');
var request = require('superagent-bluebird-promise');
var TabularFileManager = require('../../tabularfilemanager');
var validator = require('validator');

module.exports = backbone.BaseView.extend({
  events: {
    'change [data-id=file]': function(event) {
      this.fileManager.fromBlob(event.currentTarget.files[0], (function(data) {
        this.setValue('files', (this.getValue().files || []).concat(data));
      }).bind(this.parent.layout.form));

      this.$(event.currentTarget).val('');
    },

    'click [data-id=select-file]': function() {
      this.$('[data-id=file]').trigger('click');
    },

    'keydown [data-id=link]': function(event) {
      var url = this.$('[data-id=link]').val();

      if(event.keyCode !== 13)
        return true;

      this.$('[data-id=link]').val('');

      if(!validator.isURL(url)) {
        console.error('URL has worng format: ' + url);
        return false;
      }

      this.trigger('upload-started');

      // TODO Filter non-csv data with appropriate error message
      // Download data file and trigger event to let parent form to catch it up
      request.get(url)
        .then((function(result) {
          this.parseCSV({
            content: result.text,
            name: url,
            size: result.header['content-length'] || 0
          }, {isURL: true});
        }).bind(this))

        .catch(function(error) {
          console.error('Error while downloading file from url: ' + error);
        });

      return false;
    }
  },

  initialize: function(options) {
    backbone.BaseView.prototype.initialize.call(this, options);
    this.fileManager = new TabularFileManager();
  },

  render: function() { this.$el.html(this.template({})); return this; },
  template: window.TEMPLATES['step1/upload.hbs']
});
