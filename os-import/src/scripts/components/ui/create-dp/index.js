var
	_ = require('lodash'),
  backbone = require('backbone'),

  /* eslint-disable no-unused-vars */
  backboneBase = require('backbone-base');

	/* eslint-enable no-unused-vars */
	FormView = require('./form'),
	HeaderView = require('./header'),
	UploadView = require('./upload');

module.exports = backbone.BaseView.extend({
	activate: function(state) {
		if((_.isUndefined(state) || state) && _.isEmpty(this.layout))
			this.render();

		_.invoke(_.values(this.layout), 'activate', state);
		return this;
	},

	render: function() {
		this.layout.form = new FormView();
		this.layout.header = (new HeaderView()).render();
		this.layout.upload = (new UploadView()).render();
		return this;
	}
});