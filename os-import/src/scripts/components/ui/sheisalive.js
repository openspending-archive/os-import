// http://www.youtube.com/watch?v=OiBtx18jc4Q
var
  backbone = require('backbone'),

  /* eslint-disable no-unused-vars */
  backboneBase = require('backbone-base'),

  /* eslint-disable no-unused-vars */
  CreateDpView = require('./create-dp');

module.exports = backbone.BaseView.extend({
  render: function() {
    this.layout.createDp = new CreateDpView();
    return this;
  }
});
