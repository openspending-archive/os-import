require('backbone-base');
require('backbone-forms');

var
  backbone = require('backbone');

module.exports = backbone.BaseListView.extend(backbone.Form.editors.Base.prototype).extend({
  getValue: function() {},

  ItemView: backbone.BaseView.extend({
    attributes: {class: 'input'},
    template: window.TEMPLATES['create-dp/data-file-editor.hbs']
  }),

  setValue: function(value) { return this; }
});