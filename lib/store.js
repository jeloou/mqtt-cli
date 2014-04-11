module.exports = (function(packet, client, fn) {
  if (packet.topic.match('^\\$SYS\\/')) {
    if (fn) {
      fn();
    }
    return;
  }
  
  /*
    Here is where the magic happens!
  */
  
  if (fn) {
    fn();
  }
});