# mqtt-cli

A cli for running [mosca](https://github.com/mcollina/mosca)

### What is this for? 

This embeds [mosca](https://github.com/mcollina/mosca) and helps you to connect it to 
[jull.io](https://github.com/jeloou/jull-io) using [kue](https://github.com/learnboost/kue). 
It implements `authenticate`, `authorizeSubscribe`, `authorizePublish`, `publish`, `storePacket`.

### Getting started

Install with [npm](http://npmjs.org/)

```
npm install -g mqtt-cli
```

You can run it using all the options available in mosca. `config.js`  is a example of how to configure the auth back-end.
```
mqtt-cli -c config.js -v 
```



### Contributing

Feel free to open a pull request with a nice feature or a fix for some bug.

### License

See the `LICENSE.md` file.