var mosca = require('mosca');

module.exports = {
  port: 1883,
  id: 'mosca.io', // used to publish in the $SYS/<id> topicspace
  stats: true, // publish stats in the $SYS/<id> topicspace
  /*
  logger: {
    level: 'info'
  },
  backend: {
    type: 'redis',
    port: 6379,
    host: 'localhost'
  },
  */
  persistence: {
    factory: mosca.persistence.Redis,
    port: 6379,
    host: 'localhost'
  },
  /*
  secure: {
    keyPath: "/path/to/key",
    certPath: "/path/to/cert"
  }
  */
  authdb: 'mongodb://localhost/dev'
};