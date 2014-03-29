"use strict" 

var commander = require('commander')
  , authenticate = require('./lib/authenticate')
  , authorize = require('./lib/authorize')
  , publish = require('./lib/publish')
  , db = require('./lib/database')
  , pkg = require('./package')
  , async = require('async')
  , mosca = require('mosca');

function config(program, opts) {
  var defopts = {
    backend: {},
    logger: {},
    stats: true,
    persistence: {
      factory: mosca.persistence.Memory
    }
  };
  
  var opts = defopts;

  opts.port = program.port;
  
  if (program.parentPort || program.parentHost) {
    opts.backend.type = 'mqtt';
    opts.backend.port = 1883;
  }
  
  if (program.parentHost) {
    opts.backend.host = program.parentHost;
  }
  
  if (program.parentPort) {
    opts.backend.port = program.parentPort;
  }
  
  opts.backend.prefix = program.parentPrefix;
  
  if (program.disableStats) {
    opts.stats = false;
  }
  
  opts.id = program.brokerId;
  
  if (program.cert || program.key) {
    if (program.cert && program.key) {
      opts.secure = {};
      opts.secure.port = program.securePort;
      opts.secure.keyPath = program.key;
      opts.secure.certPath = program.cert;
      opts.allowNonSecure = program.nonSecure;
    }
    else {
      throw new Error('Must supply both private key and signed certificate to create secure mosca server');
    }
  }
  
  if (program.httpPort || program.onlyHttp) {
    opts.http = {
      port: program.httpPort,
      static: program.httpStatic,
      bundle: program.httpBundle
    };
    opts.onlyHttp = program.onlyHttp;
  }
  
  if (program.httpsPort) {
    if(program.cert && program.key) {
      opts.https = {
        port:   program.httpsPort,
        static: program.httpsStatic,
        bundle: program.httpsBundle
      };
    } else {
      throw new Error('Must supply both private key and signed certificate to create secure mosca websocket server');
    }
  }
  
  if (program.config) {
    opts = require(path.resolve(program.config));
    
    // merge any unspecified options into opts from defaults (defopts)
    Object.keys(defopts).forEach(function(key) {
      if(typeof opts[key] === 'undefined') {
        opts[key] = defopts[key];
      }
    });
  }
  
  if (program.verbose) {
    opts.logger.level = 30;
  } else if (program.veryVerbose) {
    opts.logger.level = 20;
  }
  
  if (program.db) {
    opts.persistence.path = program.db;
    opts.persistence.factory = persistence.LevelUp;
  }

  return opts;
}

function start(program, fn) {
  return function() {
    var server,  opts, setup;
    
    opts = config(program, opts);
    
    setup = function(fn) {
      db.get(function(err, db) {
	server.authenticate = authenticate;
	server.authorizeSubscribe = authorize.subscribe;
	server.authorizePublish = authorize.publish;
	server.publish = publish;
	
	if (fn) {
	  fn(null, server);
	}
      });
    };

    async.series([
      function(fn) {
	server = new(mosca.Server)(opts);
	server.on('ready', fn)
      },
      setup
    ], function(err, results) {
      fn(err, results[1]);
    });

    return server;
  }
}

module.exports = (function(argv, fn) {
  var program = new(commander.Command) 
    , running = false
    , doStart;
  
  argv = argv || [];
  fn = fn || function() {};
  
  program
    .version(pkg.version)
    .option('-p, --port <n>', 'the port to listen to', parseInt)
    .option('--parent-port <n>', 'the parent port to connect to', parseInt)
    .option('--parent-host <s>', 'the parent host to connect to')
    .option('--parent-prefix <s>', 'the prefix to use in the parent broker')
    .option('--credentials <file>', 'the file containing the credentials', null, './credentials.json')
    .option('--authorize-publish <pattern>', 'the pattern for publishing to topics for the added user')
    .option('--authorize-subscribe <pattern>', 'the pattern for subscribing to topics for the added user')
    .option('--key <file>', 'the server\'s private key')
    .option('--cert <file>', 'the certificate issued to the server')
    .option('--secure-port <n>', 'the TLS port to listen to', parseInt)
    .option('--non-secure', 'start both a secure and non-secure server')
    .option('--http-port <n>', 'start an mqtt-over-websocket server on the specified port', parseInt)
    .option('--https-port <n>', 'start an mqtt-over-secure-websocket server on the specified port', parseInt)
    .option('--http-static <directory>', 'serve some static files alongside the websocket client')
    .option('--https-static <directory>', 'serve some static files alongside the secure websocket client')
    .option('--http-bundle', 'serve a MQTT.js-based client at /mqtt.js on HTTP')
    .option('--https-bundle', 'serve a MQTT.js-based client at /mqtt.js on HTTPS')
    .option('--only-http', 'start only an mqtt-over-websocket server')
    .option('--disable-stats', 'disable the publishing of stats under /$SYS', null, true)
    .option('--broker-id <id>', 'the id of the broker in the $SYS/<id> namespace')
    .option('-c, --config <c>", "the config file to use (override every other option)')
    .option('-d, --db <path>', 'the path were to store the database')
    .option('-v, --verbose', 'set the bunyan log to INFO')
    .option('--very-verbose', 'set the bunyan log to DEBUG')
  
  doStart = start(program, fn);

  program
    .command('start')
    .description('start the server (optional)')
    .action(doStart);
  
  program.parse(argv);
  
  if (!running) {
    return doStart();
  }
});


