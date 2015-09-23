module.exports = function(file, doneCb, errorCb) {
  this.emit('upload-started');

  return require('blob-util').blobToBinaryString(file).then((function(string) {
    this.emit('parse-started');

    return this.parse({
      content: string,
      name: file.name,
      size: file.size
    });
  }).bind(this));
}
