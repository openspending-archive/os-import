var _ = require('lodash');

module.exports = function(file, options) {
  var blob = file.slice(0, _.min([file.size, options.maxSize]));
  this.emit('upload-started');

  return require('blob-util').blobToBinaryString(blob).then((function(string) {
    this.emit('parse-started');

    // Avoid incomplete last string
    if(blob.size < file.size)
      string = _.initial(string.split('\n')).join('\n');

    return this.parse({
      content: string,
      name: file.name,
      size: file.size
    });
  }).bind(this));
}
