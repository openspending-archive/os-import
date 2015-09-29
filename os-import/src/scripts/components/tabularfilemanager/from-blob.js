var _ = require('lodash');

module.exports = function(file, options) {
  var blob;
  this.emit('upload-started');
  blob = file.slice(0, _.min([file.size, options.maxSize]));

  return require('blob-util').blobToBinaryString(blob).then((function(string) {
    // Avoid incomplete last string
    if(blob.size < file.size)
      string = _.initial(string.split('\n')).join('\n');

    return this.parse({
      content: string,
      path: file.name,
      size: file.size
    });
  }).bind(this));
}
