/* 
   For now this does exactly the same that the
   original method.
*/
module.exports = (function(packet, client, fn) {
  var that = this, logger = this.logger, data, devices;
	
  if (client) {
    console.log('> client.id: ', client.id);
    console.log('> client.key: ', client.key);
    console.log('> packet: ', packet);
    
    try {
      data = JSON.parse(packet.payload);
    } catch(e) {
      return console.log('exception parsing json', e);
    }
    
    var type = typeof data.devices; 
    if (type != 'object' && type != 'string') {
      console.log('invalid devices especified');
      return;
    }
    
    if (type == 'object' && !data.devices.length) {
      console.log('not devices especify');
      return;
    }
    
    if (typeof data.payload == 'undefined') {
      console.log('invalid playload');
      return;
    }
    
    devices = data.devices;
    data = data.payload;
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
  payload = (!client)? packet.payload : JSON.stringify(data);
  
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
