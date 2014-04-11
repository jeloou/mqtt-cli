var authorize = module.exports
  , db = require('./database');

authorize.subscribe = function(client, topic, fn) {
  if (client.key == topic) {
    fn(null, true);
    return;
  }
  
  db.get(function(err, db) {
    var devices;
    
    devices = [client.key, topic];
    db.collection('users').find(
      {devices: {$all: devices}}, function(err, users) {
	if (err) {
	  fn('something went wrong', false);
	  return;
	}
	
	users.count(function(err, count) {
	  if (err) {
	    fn('something went wrong', false);
	    return;
	  }

	  if (count < 1) {
	    fn('not authorized, sorry', false);
	    return;
	  }

	  fn(null, true);
	});
      });
  });
};

authorize.publish = function(client, topic, payload, fn) {
  var that = this, devices;
  
  if (topic !== 'jull.io') {
    fn('sorry, not authorized', false);
    return;
  }
  
  try {
    payload = JSON.parse(payload);
  } catch(e) {
    fn('you\'ve a crappy json format', false);
    return;
  }
  
  var type = typeof payload.devices; 
  if (type != 'object' && type != 'string') {
    fn('invalid devices especified', false);
    return;
  }
  
  if (type == 'object' && !payload.devices.length) {
    fn('no devices specified', false);
    return;
  }
  
  if (typeof payload.payload == 'undefined') {
    fn('invalid playload', false);
    return;
  }
  
  db.get(function(err, db) {
    var _devices, devices = payload.devices; 

    if (err) {
      fn('something went wrong', false);
      return;
    }
    
    if (typeof devices == 'string' && devices !== client.key) {
      _devices = [devices, client.key];
    } else {
      _devices = devices.slice();
      if (_devices.indexOf(client.key) < 0) {
	_devices.push(client.key);
      }
    }

    db.collection('users').find(
      {devices: {$all: _devices}}, function(err, users) {
	users.count(function(err, count) {
	  if (err) {
	    fn('something went wrong', false);
	    return;
	  }
	  
	  if (count < 1) {
	    fn('not authorized, sorry', false);
	    return;
	  }
	  
	  client.payload = payload;
	  fn(null, true);
	});
      });
  });
};


