var db = require('./database.js');

module.exports = (function(client, username, password, fn) {
  if (!username || !password) {
    return fn(null, false);
  }
  
  db.get(function(err, db) {
    if (err) {
      return fn(err, false);
    }
    
    db.collection('keys').findOne({key: username, token: password}, function(err, key) {
      if (err) {
	return fn(err, false);
      }

      if (key) {
	client.key = key.key;
	return fn(null, true);
      }
      fn(null, false);
    });
  });
});