var Promise = require('bluebird');

module.exports = function(url, doneCb, errorCb) {
  if(!require('validator').isURL(url))
    return new Promise(function(resolve, reject) {
      reject('URL has worng format: ' + url);
    });

  this.emit('upload-started');

  // TODO Filter non-csv data with appropriate error message
  return require('superagent-bluebird-promise').get(url)
    .then((function(result) {
      return this.parse({
        content: result.text,
        name: url,
        size: result.header['content-length'] || 0
      }, {isURL: true});
    }).bind(this));
}
