var authorize = module.exports
  , db = require('./database');

authorize.subscribe = function(client, topic, fn) {
  if (client.key == topic) {
    fn(null, true);
    return;
  }
  
  db.get(function(err, db) {
    var things;
    
    things = [client.key, topic];
    db.collection('users').find(
      {things: {$all: things}}, function(err, users) {
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
  var that = this, things;
  
  if (topic !== 'io') {
    fn('sorry, not authorized', false);
    return;
  }
  
  try {
    payload = JSON.parse(payload);
  } catch(e) {
    fn('you\'ve a crappy json format', false);
    return;
  }
  
  var type = typeof payload.things; 
  if (type != 'object' && type != 'string') {
    fn('invalid things especified', false);
    return;
  }
  
  if (type == 'object' && !payload.things.length) {
    fn('no things specified', false);
    return;
  }
  
  if (typeof payload.payload == 'undefined') {
    fn('invalid playload', false);
    return;
  }
  
  db.get(function(err, db) {
    var _things, things = payload.things; 

    if (err) {
      fn('something went wrong', false);
      return;
    }
    
    if (typeof things == 'string' && things !== client.key) {
      _things = [things, client.key];
    } else {
      _things = things.slice();
      if (_things.indexOf(client.key) < 0) {
	_things.push(client.key);
      }
    }
    
    var i;
    if ((i = _things.indexOf('master')) > -1) {
      _things.splice(i, 1);
    }

    db.collection('users').findOne(
      {things: {$all: _things}}, function(err, user) {
	if (err) {
	  fn('something went wrong', false);
	  return;
	}

	if (!user) {
	  fn('not authorized, sorry', false);
	  return;
	}
	
	client.user = user._id;
	fn(null, true);
      }
    );
  });
};


