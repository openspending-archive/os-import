require('backbone-base');
require('fileapi');

var
  _ = require('lodash'),
  backbone = require('backbone'),
  csv = require('csv'),
  jtsInfer = require('json-table-schema').infer,
  request = require('superagent-bluebird-promise'),
  validator = require('validator');

module.exports = backbone.BaseView.extend({
  events: {
    'change [data-id=file]': function(event) {
      this.uploadLocalFile(FileAPI.getFiles(event.currentTarget)[0]);
      this.$(event.currentTarget).val('');
    },

    'click [data-id=select-file]': function() { this.$('[data-id=file]').trigger('click'); },

    'keydown [data-id=link]': function(event) {
      var
        url = this.$('[data-id=link]').val();

      this.$('[data-id=link]').val('');

      if(event.keyCode !== 13)
        return true;

      if(!validator.isURL(url)) {
        console.error('URL has worng format: ' + url);
        return false;
      }

      this.trigger('upload-started');

      // TODO Filter non-csv data with appropriate error message
      // Download data file and trigger event to let parent form to catch it up
      request.get(url)
        .then((function(result) { this.parseCSV(_.last(url.split('/')), result.text); }).bind(this))
        .catch(function(error) { console.error('Error while downloading file from url: ' + error); });

      return false;
    }
  },

  parseCSV: function(name, string) {
    csv.parse(string, (function(error, data) {
      // TODO Implement parse errors rendering
      if(error) {
        console.log(error);
        this.trigger('parse-error');
        return false;
      }

      this.trigger('parse-complete', {
        data: data,
        name: name,
        schema: jtsInfer(data[0], _.rest(data))
      });
    }).bind(this));

    return this;
  },

  render: function() { this.$el.html(this.template({})); return this; },
  template: window.TEMPLATES['create-dp/upload.hbs'],

  uploadLocalFile: function(file) {
    this.trigger('upload-started');

    FileAPI.readAsText(file, (function(fileEvent) {
      if(fileEvent.type === 'load')
        this.parseCSV(fileEvent.target.name, fileEvent.result);
      
      else if(fileEvent.type !== 'progress') {
        this.trigger('upload-error');

        // TODO Implement upload errors rendering
        this.setError('File upload failed');
      }
    }).bind(this));

    return this;
  }
});
