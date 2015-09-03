require('backbone-base');

var
  backbone = require('backbone');

module.exports = backbone.BaseView.extend({
  activate: function(state) {
    backbone.BaseView.prototype.activate.call(this, state);
    window.APP.activateOverlay(state);
    window.APP.off(null, null, this);

    if(state === false)
      return this;

    window.APP.on('click', function(el) {
      if(!this.$(el).closest(this.$('[data-id=content]')).size())
        this.deactivate();
    }, this);

    return this;
  }
});
