require('backbone-base');
require('fileapi');

var
  _ = require('lodash'),
  backbone = require('backbone'),
  csv = require('csv'),
  GoodTables = require('goodtables'),
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

  initialize: function(options) {
    backbone.BaseView.prototype.initialize.call(this, options);
    this.goodTables = new GoodTables({method: 'post', report_type: 'grouped'});
  },

  // Get CSV schema and validate text and schema over good tables
  parseCSV: function(name, string) {
    csv.parse(string, (function(error, data) {
      var
        // https://github.com/gvidon/backbone-base/issues/2
        id = [name, (new Date()).getTime()].join(''),

        schema;

      if(error) {
        this.trigger('parse-complete', {
          id: id,
          name: name,
          parseError: {message: error}
        });

        return false;
      }

      schema = jtsInfer(data[0], _.rest(data));

      this.goodTables.run(string, JSON.stringify(schema))
        .then((function(result) {
          var
            errors = result.getValidationErrors();

          this.trigger('parse-complete', {
            data: data,
            id: id,
            name: name,

            parseError: !_.isEmpty(errors) && {
              message: 'We encountered some problems with this file. Click here for a breakdown of the issues.',
              verbose: result.getGroupedByRows()
            },

            schema: schema,
            text: string
          });
        }).bind(this))

        .catch(console.error);
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
