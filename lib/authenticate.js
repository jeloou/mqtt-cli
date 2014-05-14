var db = require('./database.js');

module.exports = (function(client, username, password, fn) {
  if (!username || !password) {
    return fn(null, false);
  }
  
  db.get(function(err, db) {
    if (err) {
      return fn(err, false);
    }
    
    db.collection('things').findOne(
      {'key.key': username, 'key.token': password}, function(err, thing) {
	if (err) {
	  return fn(err, false);
	}
	
	if (thing) {
	  client.key = thing.key.key;
	  client.user = thing.user;
	  return fn(null, true);
	}
	fn(null, false);
      });
  });
});