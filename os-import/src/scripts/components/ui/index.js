// Required during objects init below
window.TEMPLATES = require('../../../templates');

var backbone = require('backbone');
var Router = require('./router');
var SheIsAliveView = require('./sheisalive');
window.APP = new SheIsAliveView({el: 'body'});
window.ROUTER = new Router();
window.APP.render();
backbone.history.start({pushState: true});
