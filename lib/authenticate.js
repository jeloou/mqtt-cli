var db = require('./database.js');

module.exports = (function(client, username, password, fn) {
  if (!username || !password) {
    return fn(null, false);
  }
  
  db.get(function(err, db) {
    if (err) {
      return fn(err, false);
    }
    
    db.collection('devices').findOne(
      {'key.key': username, 'key.token': password}, function(err, device) {
	if (err) {
	  return fn(err, false);
	}
	
	if (device) {
	  client.key = device.key.key;
	  client.user = device.user;
	  return fn(null, true);
	}
	fn(null, false);
      });
  });
});