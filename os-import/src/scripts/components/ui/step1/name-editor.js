require('backbone-forms');
var _ = require('lodash');
var backbone = require('backbone');
var slug = require('slug');

// Get the name and render resulting URL
module.exports = backbone.Form.editors.Base.extend({
  attributes: {class: 'input'},

  events: {
    'keyup [data-id=name]': function(event) {
      var value = event.currentTarget.value;
      this.trigger('change', value);
      this.updateSlug(value);
    }
  },

  getValue: function() { return this.$('[data-id=name]').val(); },

  render: function() {
    this.$el.html(this.template(_.extend(this.schema, {unique: this.cid})));
    return this;
  },

  setValue: function(value) {
    this.$('[data-id=name]').val(value);
    return this;
  },

  template: window.TEMPLATES['create-dp/name-editor.hbs'],

  validate: function() {
    var error = backbone.Form.editors.Base.prototype.validate.call(this);

    this.$('[data-id=error]')
      .prop('hidden', _.isEmpty(error)).html((error || {}).message);

    return error;
  },

  updateSlug: function(name) {
    this.$('[data-id=slug]').html(slug(name).toLowerCase());
    return this;
  }
});
