var backbone = require('backbone');
var BigbangView = require('./components/ui/sheisalive');
var Router = require('./router');


window.APP = new SheisAliveView({el: '#application'});
window.ROUTER = new Router();

window.APP.render();
backbone.history.start({pushState: true});
