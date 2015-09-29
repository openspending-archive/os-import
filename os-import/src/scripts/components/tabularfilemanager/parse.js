var _ = require('lodash');
var JSONSchema = require('json-table-schema');
var Promise = require('bluebird');

// Emit data with critical error message
function emitError(path, error) {
  var result;

  this.emit('parse-complete', result = {
    path: path,
    parseError: {message: error}
  });

  return result;
}

function infer(data) { return JSONSchema.infer(data[0], _.rest(data)); }

/*
  Translate CSV file into js object, validate and infer the scehma.
  @param {object} file — {content: <CSV file itself, string>, name: <name to be displayed>, size: <in bytes>}
  @param {object} options — {isURL: <true if file was downloaded from URL>, <noSchemaInfer>: Boolean, noValidation: <Boolean>}
*/
module.exports = function(file, options) {
  var noSchemaInfer = _.result(options, 'noSchemaInfer');
  var noValidation = _.result(options, 'noValidation');
  this.emit('parse-started');

  return new Promise((function(resolve, reject) {
    require('csv').parse(file.content, (function(error, data) {
      // https://github.com/gvidon/backbone-base/issues/2
      var id = [file.name, (new Date()).getTime()].join('');

      // Helpful to know that string used as file path is URL when need to get file name
      var isURL = (options || {}).isURL;

      if(error) {
        reject(this.file = emitError.call(this, file.path, error));
        return false;
      }

      // Save options for later use — check if there was validation or infering
      this.file = _.extend({
        data : data,
        id   : id,
        path : file.path,
        size : file.size,
        text : file.content
      }, options);

      if(noValidation) {
        resolve(this.file = _.extend(this.file, !noSchemaInfer ? {
          schema: infer(data)
        } : {}));

        return false;
      }

      this.emit('validation-started');

      this.goodTables.run(file.content)
        .then((function(result) {
          var errors = result.getValidationErrors();
          var isValid = _.isEmpty(errors);

          // Return validation report and schema if data file is valid and no noSchemaInfer
          // option passed
          this.emit('parse-complete', this.file = _.extend(this.file, {
            parseError: !isValid && {
              message: 'We encountered some problems with this file. Click ' +
                'here for a breakdown of the issues.',

              verbose: result.getGroupedByRows()
            }
          }, !noSchemaInfer ? {schema: isValid && infer(data)} : {}));

          resolve(this.file);
        }).bind(this))

        .catch((function(error) {
          reject(this.file = emitError.call(this, file.path, error));
        }).bind(this));
    }).bind(this));
  }).bind(this));
}