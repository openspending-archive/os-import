var
  backbone = require('backbone'),
  Router = require('./router'),
  SheIsAliveView = require('./components/ui/sheisalive');

window.APP = new SheIsAliveView({el: '#application'});
window.ROUTER = new Router();
window.APP.render();
backbone.history.start({pushState: true});
