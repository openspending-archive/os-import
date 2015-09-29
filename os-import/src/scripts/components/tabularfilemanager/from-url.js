var _ = require('lodash');
var Promise = require('bluebird');
var request = require('http');

function byteLen(string, encoding) {
  return Buffer.byteLength(string, encoding);
}

// Get file from URL. Get first transfer chunks until their size exceeds options param.
module.exports = function(url, options) {
  var parsedURL = require('url').parse(url);

  if(!require('validator').isURL(url))
    return new Promise(function(resolve, reject) {
      reject('URL has worng format: ' + url);
    });

  this.emit('upload-started');

  return new Promise(function(resolve, reject) {
    request.get({
      hostname: parsedURL.hostname,
      method: 'GET',
      path: parsedURL.path,
      port: parsedURL.port || 80,

      // Avoid CORS
      withCredentials: false
    }, function(response) {
      var data = '';

      var encoding = require('charset')(response.headers['content-type'])
        || 'utf8';

      var hasSizeLimit = _.result(options, 'maxSize');

      response.on('data', function(chunk) {
        if(hasSizeLimit && byteLen(data, encoding) >= options.maxSize)
          return;

        data += chunk;

        if(!hasSizeLimit)
          return;

        if(byteLen(data, encoding) <= options.maxSize)
          return;

        // If data exceed bytes limit then cut it. Remove last line as it can be incomplete.
        data = _.initial(
          (new Buffer(data, encoding))
            .slice(0, options.maxSize)
            .toString()
            .split('\n')
        ).join('\n')
      });

      response.on('end', function() {
        resolve(data, byteLen(data, encoding));
      });
    });
  }).then((function(data, size) {
    // TODO Filter non-csv data with appropriate error message
    return this.parse({
      content: data,
      path: url,
      size: size
    }, {isURL: true});
  }).bind(this));
}
