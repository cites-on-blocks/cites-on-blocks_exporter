/* Import Modules. */
// 3rd party modules
const koa = require('koa') // General Koa package the server base on.
const http = require('http') // To receive and send HTTP messages.

/* Initiate Modules */
// Create the Koa application.
const app = new koa()

/* Load Configuration */
// Have to be loaded after the app initiation, cause else the environment is not defined.
const general_prop = require(__dirname + '/config/general_prop.js')(app.env)

/* Middleware */
// The order of the different middle ware components is absolutely important!

app.use(async (ctx, next) => {
  ctx.body = 'Hello Work'
  next()
})

/* Start Server */
http.createServer(app.callback()).listen(general_prop.port_http)
console.log(
  'HTTP server has started and is listening on port ' + general_prop.port_http
)
