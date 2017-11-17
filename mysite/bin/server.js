#!/usr/bin/env node

/**
 * Module dependencies.
 */

var app = require('../app');
var debug = require('debug')('cecs-478:server');
var http = require('http');
var fs = require('fs');
var https = require('https');

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '80');
app.set('port', port);

// Create HTTPS server
var https_options = {
	key:		fs.readFileSync('../sslcert/privkey.pem', 'utf8'),
	cert:		fs.readFileSync('../sslcert/fullchain.pem', 'utf8'),
	secureProtocol:	'TLSv1_2_method',
	ciphers:	'HIGH:!EXPORT:!MEDIUM:!LOW:!aNULL:!eNULL:!SSLv2:!SHA1:!CAMELLIA:!RSA'
}
var https_server = https.createServer(https_options, app);
https_server.listen(443);
https_server.on('error', onError);
https_server.on('listening', onListening);


/**
 * Create HTTP server.
 */

var http_server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

http_server.listen(port);
http_server.on('error', onError);
http_server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = this.address(); // changed server.address() to this.address
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
