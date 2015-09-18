require('backbone-base');
var backbone = require('backbone');

module.exports = backbone.BaseListView.extend({
  ItemView: backbone.BaseView.extend({
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    },

    tagName: 'tr',
    template: window.TEMPLATES['create-dp/user-data-item.hbs']
  })
});
