var kue = require('kue')
  , moment = require('moment');

module.exports = (function(opts) {
  var default_backend, jobs;

  default_backend = true;
  var backend = opts.backend;
  
  if (!isDefault(opts)) {
    default_backend = false;
    jobs = kue.createQueue({
      host: backend.host,
      port: backend.port
    });
  }
  
  return (function(packet, client, fn, stored) {
    var payload;
    
    if (stored || packet.topic.match('^\\$SYS\\/')) {
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
    payload = JSON.parse(packet.payload);
    payload.at = moment.utc().format();
    payload.thing = client.key;
    payload.user = client.user;
    
    jobs
      .create('store', payload)
      .priority('high')
      .save();
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
