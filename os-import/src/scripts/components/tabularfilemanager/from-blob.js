module.exports = function(file, doneCb, errorCb) {
  this.emit('upload-started');

  require('blob-util').blobToBinaryString(file).then((function(string) {
    this.emit('parse-started');

    this.parse({
      content: string,
      name: file.name,
      size: file.size
    }, {
      doneCb: doneCb,
      errorCb: errorCb
    });
  }).bind(this)).catch(errorCb);

  return this;
}