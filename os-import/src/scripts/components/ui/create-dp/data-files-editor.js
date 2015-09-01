require('backbone-base');
require('backbone-forms');

var
  _ = require('lodash'),
  backbone = require('backbone');

module.exports = backbone.BaseListView.extend(backbone.Form.editors.Base.prototype).extend({
  getValue: function() { return (this.collection && this.collection.length) ? this.collection.toJSON() : ''; },

  initialize: function(options) {
    backbone.BaseListView.prototype.initialize.call(this, options);
    backbone.Form.editors.Base.prototype.initialize.call(this, options);
  },

  ItemView: backbone.BaseView.extend({
    attributes: {class: 'input'},

    events: {
      'click [data-id=replace]': function() { this.$('[data-id=file]').trigger('click'); },
      'click [data-id=remove]': function() { this.parent.collection.remove(this.model); },

      // Replace current file and upload new on when Replace button clicked
      'change [data-id=file]': function(event) {
        this.parent.collection.remove(this.model);
        this.parent.schema.uploader(FileAPI.getFiles(event.currentTarget)[0]);
      }
    },

    render: function() { this.$el.html(this.template(this.model.toJSON())); return this; },
    template: window.TEMPLATES['create-dp/data-file-editor-item.hbs']
  }),

  render: function() { this.$el.html(this.template()); return this; },

  // Passed with array of objects
  setValue: function(files) {
    this.$('[data-id="generic-error"]').prop('hidden', true).html('');
    this.reset(new backbone.Collection(files));
    return this;
  },

  template: window.TEMPLATES['create-dp/data-file-editor.hbs'],

  validate: function() {
    var
      error = backbone.Form.editors.Base.prototype.validate.call(this);

    if(!_.isEmpty(error)) {
      this.$('[data-id="generic-error"]').prop('hidden', false).html(error.message);
      return error;
    }
  }
});