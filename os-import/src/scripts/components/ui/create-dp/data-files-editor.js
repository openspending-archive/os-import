require('backbone-base');
require('backbone-forms');

var
  backbone = require('backbone');

module.exports = backbone.BaseListView.extend(backbone.Form.editors.Base.prototype).extend({
  getValue: function() { return this.collection.toJSON(); },

  initialize: function(options) {
    backbone.BaseListView.prototype.initialize.call(this, options);
    backbone.Form.editors.Base.prototype.initialize.call(this, options);
    this.collection = new backbone.Collection();
  },

  ItemView: backbone.BaseView.extend({
    events: {'click [data-id=remove]': function() { this.parent.collection.remove(this.model); }},
    render: function() { this.$el.html(this.template(this.model.toJSON())); return this; },
    template: window.TEMPLATES['create-dp/data-file-editor.hbs']
  }),

  // Passed with array of objects
  setValue: function(files) { this.reset(new backbone.Collection(files)); return this; }
});