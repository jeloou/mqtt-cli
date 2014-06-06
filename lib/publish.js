var db = require('./database');

module.exports = (function(packet, client, fn) {
  var that = this, logger = this.logger, things, payload;
  
  if (client) {
    var _payload;
    _payload = JSON.parse(packet.payload);
    things = _payload.things;
    payload = _payload.payload;
  }
  
  if (typeof client == 'function') {
    fn = client;
    client = null;
  } else if (client) {
    logger = client.logger;
  }
  
  if (!fn) {
    fn = function() {};
  }
  
  var options = {
    qos: packet.qos,
    mosca: {
      client: client, 
      packet: packet
    }
  };

  topics = (!client)? packet.topic : things;
  payload = (!client)? packet.payload : JSON.stringify(payload);
  
  if (client) {
    var i;
    if ((i = topics.indexOf('master')) > -1) {
      topics.splice(i, 1);
      topics.push('~user+'+client.user);
    }
  }
  
  var stored = false;
  publish.apply(this, [topics, payload, options, function() {
    that.storePacket(packet, client, function() {
      stored = true;
      that.published(packet, client, function() {
	logger.debug({ packet: packet }, 'published packet');
	that.emit('published', packet, client);
	fn();
      });
    }, stored);
  }]);
});

function publish(topics, payload, options, fn) {
  var that = this;
  
  topics = typeof topics == 'string'? [topics] : topics;
  topics.forEach(function(topic) {
    that.ascoltatore.publish(
      topic,
      payload,
      options,
      fn
    );
  });
}
