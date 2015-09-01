require('backbone-base');
require('backbone-forms');

var
  _ = require('lodash'),
  backbone = require('backbone'),
  DataFilesEditor = require('./data-files-editor'),
  NameEditor = require('./name-editor'),
  UploadView = require('./upload');

module.exports = backbone.Form.extend(backbone.BaseView.prototype).extend({
  activate: function(state) {
    backbone.BaseView.prototype.activate.call(this, state);

    if((_.isUndefined(state) || state) && _.isEmpty(this.layout))
      this.render();

    // Do not allow chuld view (upload widget) to change parent — just catch its events
    this.layout.upload.on('upload-started', this.loading, this);

    this.layout.upload.on('parse-complete', function(csvData) {
      // TODO Apply data to the form
      console.log(csvData);
      this.loading(false);
    }, this);

    return this;
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
    this.$el.html(this.template({}));
    this.layout.upload = (new UploadView({el: this.$('[data-id=upload]'), parent: this})).render();
    return this;
  },

  schema: {
    title: {label: 'Name your Data Package', type: NameEditor, validator: ['required'], urlBase: 'https://openspending.org/'},
    files: {type: DataFilesEditor, validator: ['required']}
  },

  template: window.TEMPLATES['create-dp/form.hbs']
});
