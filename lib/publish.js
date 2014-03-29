/* 
   For now this does exactly the same that the
   original method.
*/
module.exports = (function(packet, client, fn) {
  var that = this, logger = this.logger;
	
  if (client) {
    console.log('> client.id: ', client.id);
    console.log('> packet: ', packet);
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
  
  this.ascoltatore.publish(
    packet.topic,
    packet.payload,
    options,
    function() {
      that.storePacket(packet, function() {
        that.published(packet, client, function() {
	  logger.debug({ packet: packet }, 'published packet');
	  that.emit('published', packet, client);
	  fn();
        });
      });
    }
  );
});