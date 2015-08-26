var backbone = require('backbone');
var SheIsAliveView = require('./components/ui/sheisalive');
var Router = require('./router');


window.APP = new SheIsAliveView({el: '#application'});
window.ROUTER = new Router();

window.APP.render();
backbone.history.start({pushState: true});
