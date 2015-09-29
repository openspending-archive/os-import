var _ = require('lodash');

// Read data from File object, suitable only for in-browser usage
var fromBlob = require('./from-blob');

// TODO To be implemented
var fromFile = function() {};

// Read data directly from URL
var fromURL = require('./from-url');

var validator = require('validator');

module.exports = function(path) {
  var isURL;
  var that = this;

  return (new Promise(function(resolve, reject) {
    var method;

    if(_.isString(path) && validator.isURL(path)) {
      method = fromURL;
      isURL = true;
    }

    // Let the called method do the check if file exists
    else if(_.isString(path))
      method = fromFile;

    else if(typeof Blob !== 'undefined' && path instanceof Blob)
      method = fromBlob;

    else {
      reject('Invalid file type');
      return false;
    }

    method.call(that, path, that.options).then(resolve);
  }))
    .catch(console.log)

    .then(function(data, size) {
      // TODO Filter non-csv data with appropriate error message
      return that.parse({
        content: data,
        path: path,
        size: size
      }, _.extend(this.options, {isURL: isURL}));
    });
}