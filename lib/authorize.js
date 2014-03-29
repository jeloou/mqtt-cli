var authorize = module.exports;

authorize.subscribe = function(client, topic, fn) {
  fn(null, true);
};

authorize.publish = function(client, topic, payload, fn) {
  fn(null, true);
};


