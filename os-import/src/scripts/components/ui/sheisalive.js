// http://www.youtube.com/watch?v=OiBtx18jc4Q
require('backbone-base');

var
  backbone = require('backbone'),
  CreateDpView = require('./create-dp');

module.exports = backbone.BaseView.extend({
  render: function() {
    this.layout.createDp = new CreateDpView();
    return this;
  }
});
