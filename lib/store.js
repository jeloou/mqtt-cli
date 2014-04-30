module.exports = (function(opts) {
  var default_backend;


  default_backend = true;
  if (!isDefault(opts)) {
    default_backend = false;
  }
  
  return (function(packet, fn) {
    var payload; 

    if (packet.topic.match('^\\$SYS\\/')) {
      fn();
      return;
    }
    
    if (default_backend) {
      fn();
      return;
    }
    
    /*
      Here is where the magic happens!
    */
    fn();
  });
});

function isDefault(opts) {
  if (toString.call(opts.backend) !== '[object Object]') {
    return true;
  }
  
  if (toString.call(opts.backend.type) == '[object Undefined]' || opts.backend.type !== 'redis') {
    return true;
  }
  return false;
}
