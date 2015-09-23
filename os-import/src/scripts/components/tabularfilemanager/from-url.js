module.exports = function(url, doneCb, errorCb) {
  if(!require('validator').isURL(url)) {
    errorCb(null, 'URL has worng format: ' + url);
    return false;
  }

  this.emit('upload-started');

  // TODO Filter non-csv data with appropriate error message
  // Download data file and trigger event to let parent form to catch it up
  require('superagent-bluebird-promise').get(url)
    .then((function(result) {
      this.parse({
        content: result.text,
        name: url,
        size: result.header['content-length'] || 0
      }, {
        doneCb: doneCb,
        errorCb: errorCb,
        isURL: true
      });
    }).bind(this))

    .catch(function(error) {
      errorCb(null, 'Error while downloading file from url: ' + error);
    });

  return this; 
}
