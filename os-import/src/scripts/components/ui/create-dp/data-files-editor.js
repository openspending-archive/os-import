require('backbone-base');
require('backbone-forms');

var
  backbone = require('backbone');

module.exports = backbone.Form.editors.Base.extend(backbone.BaseListView).extend({
  getValue: function() {},
  setValue: function(value) { return this; }
});