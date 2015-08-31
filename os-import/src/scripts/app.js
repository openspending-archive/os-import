// Required during objects init below
window.TEMPLATES = require('../templates');

var
  backbone = require('backbone'),
  Router = require('./router'),
  SheIsAliveView = require('./components/ui/sheisalive');

window.APP = new SheIsAliveView({el: 'body'});
window.ROUTER = new Router();
window.APP.render();
backbone.history.start({pushState: true});
