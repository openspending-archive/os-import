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

/*
  Translate CSV file into js object, validate and infer the scehma.
  @param {object} file — {content: <CSV file itself, string>, name: <name to be displayed>, size: <in bytes>}
  @param {object} options — {isURL: <true if file was downloaded from URL>}
*/
module.exports = function(file, options) {
  this.emit('parse-started');

  return new Promise((function(resolve, reject) {
    require('csv').parse(file.content, (function(error, data) {
      // https://github.com/gvidon/backbone-base/issues/2
      var id = [file.name, (new Date()).getTime()].join('');

      var isURL = (options || {}).isURL;
      var schema;

      if(error) {
        reject(this.file = emitError.call(this, error));
        return false;
      }

      this.emit('validation-started');

      this.goodTables.run(file.content)
        .then((function(result) {
          var errors = result.getValidationErrors();
          var isValid = _.isEmpty(errors);

          // Get schema for only valid CSVs
          if(isValid)
            schema = require('json-table-schema').infer(data[0], _.rest(data));

          this.emit('parse-complete', this.file = {
            data : data,
            id   : id,
            isURL: isURL,
            name : file.name,

            parseError: !isValid && {
              message: 'We encountered some problems with this file. Click ' +
                'here for a breakdown of the issues.',

              verbose: result.getGroupedByRows()
            },

            schema: schema,
            size: file.size,
            text: file.content
          });

          resolve(this.file);
        }).bind(this))

        .catch((function(error) {
          reject(this.file = emitError.call(this, error));
        }).bind(this));
    }).bind(this));
  }).bind(this));
}