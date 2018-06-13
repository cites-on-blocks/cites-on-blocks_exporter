/* Require Modules */
// 3rd party modules
const fs = require('fs')
const execSync = require('child_process').execSync

// Configurations
const ssl_prop = require(__dirname + '/config/ssl_prop.js')

/* Properties */
const cmd_generateKey = 'openssl genrsa -out ' + ssl_prop.paths.key + ' 2048'
const cmd_generateCert =
  'echo -e "\n\n\n\n\n\n\n" | openssl req -new -x509 -key ' +
  ssl_prop.paths.key +
  ' -out ' +
  ssl_prop.paths.cert +
  ' -days 3650'
const exec_options = { stdio: 'ignore' }

/**
 * Function which initialize the SSL base.
 * This includes to check if the SSL key and certificate exist, which are
 * required by the HTTPS protocol for the server.
 * If not so, the user gets informed about that.
 * In case the server has been started in development environment, both files
 * get generated automatically.
 */
const initSSL = env => {
  // Create the folder where the key and certificate are placed, if necessary.
  if (!fs.existsSync(ssl_prop.paths.base)) {
    console.log('Create directory for SSL key and certificate...')
    fs.mkdirSync(ssl_prop.paths.base)
  }

  // Generate the key, if necessary.
  if (!fs.existsSync(ssl_prop.paths.key)) {
    // Only available for the development mode.
    if (env !== 'development') {
      console.log('Missing SSL key!')
      process.exit(1)
    }

    try {
      console.log('Generate key')
      execSync(cmd_generateKey, exec_options)
    } catch (err) {
      console.log(err)
      process.exit(1)
    }
  }

  // Generate the certificate, if necessary.
  if (!fs.existsSync(ssl_prop.paths.cert)) {
    // Only available for the development mode.
    if (env !== 'development') {
      console.log('Missing SSL key!')
      process.exit(1)
    }
    try {
      console.log('Generate certificate')
      const out = execSync(cmd_generateCert, exec_options)
    } catch (err) {
      console.log(err)
      process.exit(1)
    }
  }
}

// Define the export.
module.exports = {
  initSSL: initSSL
}
