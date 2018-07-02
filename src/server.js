/* Import Modules. */
// 3rd party modules
const koa = require('koa') // General Koa package the server base on.
const http = require('http') // To receive and send HTTP messages.
const https = require('https') // For TLS encryption.
const sslify = require('koa-sslify') // Force HTTPS connections.
const logger_bunyan = require('koa-bunyan-logger') // To log connections and other content.
const cors = require('@koa/cors') // To allow cross origin requests in the development mode.

// Own
const bootstrap = require(__dirname + '/bootstrap.js') // Utility functions to bootstrap the server.
const logger = require(__dirname + '/logger.js') // The bunyan logger instance.
const exportRouter = require(__dirname + '/router/exporter.js') // The koa router which implements the API to export permits.

/* Initiate Modules */
// Create the Koa application.
const app = new koa()

/* Load Configuration */
// Have to be loaded after the app initiation, cause else the environment is not defined.
const general_prop = require(__dirname + '/config/general_prop.js')(app.env)
const ssl_prop = require(__dirname + '/config/ssl_prop.js')

/* Middleware */
// The order of the different middle ware components is absolutely important!

if (app.env === 'development') {
  console.log('Enable COR for development usage.')
  app.use(cors())
}

// Add logger for the connections.
bootstrap.initLogging()
app.use(logger_bunyan(logger.logger))
app.use(logger_bunyan.requestLogger(logger.logger))

// Force HTTPS connections.
bootstrap.initSSL(app.env)
app.use(sslify(ssl_prop.options_sslify(app.env)))

// Add the router(s).
app.use(exportRouter.routes())

/* Start Server */
http.createServer(app.callback()).listen(general_prop.port_http)
const msg_http =
  'HTTP server has started and is listening on port ' + general_prop.port_http
logger.logger.info(msg_http)
console.log(msg_http)

https
  .createServer(ssl_prop.options_https(), app.callback())
  .listen(general_prop.port_https)
const msg_https =
  'HTTPS server has started and is listening on port ' + general_prop.port_https
logger.logger.info(msg_https)
console.log(msg_https)
