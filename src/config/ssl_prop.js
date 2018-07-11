/* Load Modules */
// 3rd party modules
const fs = require('fs')

// Own
const general_prop = require(__dirname + '/general_prop.js')

/* Parameter & Variables */
const path_base = __dirname + '/../../certificates/'
const path_key = path_base + 'key.pem'
const path_cert = path_base + 'cert.pem'

// Load the key and cert from the file system.
function options_https() {
  return {
    key: fs.readFileSync(path_key),
    cert: fs.readFileSync(path_cert)
  }
}

// Define the sslify options to enforce HTTPS.
function options_sslify(env) {
  return {
    port: general_prop(env).port_https
  }
}

// Define what will be exported.
module.exports = {
  options_https: options_https,
  options_sslify: options_sslify,
  paths: {
    base: path_base,
    key: path_key,
    cert: path_cert
  }
}
