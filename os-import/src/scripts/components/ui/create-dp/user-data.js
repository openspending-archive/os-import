require('backbone-base');
var backbone = require('backbone');

module.exports = backbone.BaseListView.extend({
  ItemView: backbone.BaseView.extend({
    tagName: 'tr',
    template: window.TEMPLATES['create-dp/user-data-item.hbs']
  })
});
