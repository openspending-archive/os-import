var path = require('path')
  , _ = require('underscore')
  , nconf = require('nconf')
  , fs = require('fs')
  ;

nconf.file({file: path.join(path.dirname(path.dirname(__dirname)), '/settings.json')});

 // this is the object that you want to override in your own local config
nconf.defaults({
  apikey: process.env.APIKEY || 'APIKEY',

  appconfig: {
    port: process.env.PORT || 5000,
    auth_on: process.env.AUTH_ON !== undefined || false,
    auth_user: process.env.AUTH_USER,
    auth_passhash: process.env.AUTH_PASSHASH,
  },

  database: {
    username: process.env.DB_USER || 'opendatacensus',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'opendatacensus',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: process.env.DB_DIALECT || 'postgres'
  },

  debug: Boolean(process.env.DEBUG),
  locales: ['en'],
  missing_place_html: '',
  bucket: process.env.BUCKET,

  s3: {
    key: process.env.S3_KEY,
    secret: process.env.S3_SECRET,
    bucket: process.env.S3_BUCKET || (process.env.DEBUG ? '/tmp/os-upload' : 'data.openspending.org'),
    region: process.env.S3_REGION || 'us-standard'
  },

  site_url: process.env.SITE_URL || 'http://localhost:5000',
  title_short: 'OpenDataSpending'
});

module.exports = {
  get: function(key, lang) {
    if (lang)
      return nconf.get.call(nconf, key + '@' + lang) ||
        nconf.get.call(nconf, key + '@' + _.first(module.exports.get('locales'))) ||
        nconf.get.call(nconf, key);

    return nconf.get.call(nconf, key);
  },

  set: nconf.set.bind(nconf),
  reset: nconf.reset.bind(nconf)
};
