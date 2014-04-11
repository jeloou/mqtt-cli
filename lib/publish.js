/* 
   For now this does exactly the same that the
   original method.
*/

var db = require('./database');

module.exports = (function(packet, client, fn) {
  var that = this, logger = this.logger, devices, payload;
  
  if (client) {
    devices = client.payload.devices;
    payload = client.payload.payload;
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

  topics = (!client)? packet.topic : devices;
  payload = (!client)? packet.payload : JSON.stringify(payload);
  
  publish.apply(this, [topics, payload, options, function() {
    that.storePacket(packet, function() {
      that.published(packet, client, function() {
	logger.debug({ packet: packet }, 'published packet');
	that.emit('published', packet, client);
	fn();
      });
    });
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
