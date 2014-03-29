var MongoClient = require('mongodb').MongoClient
  , config = require('./../config')
  , _db = null;

module.exports.get = (function(fn) {
  if (_db) {
    return fn(null, _db);
  }
  
  MongoClient.connect(config.authdb, function(err, db) {
    if (err) {
      return fn(err, null);
    }
    _db = db;
    fn(null, _db);
  });
});