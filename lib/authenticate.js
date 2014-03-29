var db = require('./database.js');

module.exports = (function(client, username, password, fn) {
  db.get(function(err, db) {
    if (err) {
      return fn(err, null);
    }
    db.collection('keys').findOne({key: username, token: password}, function(err, key) {
      fn(null, !err && key);
    });
  });
});