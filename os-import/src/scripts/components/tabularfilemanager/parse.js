var _ = require('lodash');
var Promise = require('bluebird');

// Emit data with critical error message
function emitError(error) {
  var result;

  this.emit('parse-complete', result = {
    id        : id,
    isURL     : isURL,
    name      : file.name,
    parseError: {message: error}
  });

  return result;
}

module.exports = function(file, options) {
  return new Promise((function(resolve, reject) {
    require('csv').parse(file.content, (function(error, data) {
      // https://github.com/gvidon/backbone-base/issues/2
      var id = [file.name, (new Date()).getTime()].join('');

      var isURL = (options || {}).isURL;
      var schema;

      if(error) {
        reject(this.result = emitError.call(this, error));
        return false;
      }

      schema = require('json-table-schema').infer(data[0], _.rest(data));
      this.emit('validation-started');

      this.goodTables.run(file.content, JSON.stringify(schema))
        .then((function(result) {
          var errors = result.getValidationErrors();

          this.emit('parse-complete', this.result = {
            data : data,
            id   : id,
            isURL: isURL,
            name : file.name,

            parseError: !_.isEmpty(errors) && {
              message: 'We encountered some problems with this file. Click ' +
                'here for a breakdown of the issues.',

              verbose: result.getGroupedByRows()
            },

            schema: schema,
            size: file.size,
            text: file.content
          });

          resolve(this.result);
        }).bind(this))

        .catch((function(error) {
          reject(this.result = emitError.call(this, error));
        }).bind(this));
    }).bind(this));
  }).bind(this));
}