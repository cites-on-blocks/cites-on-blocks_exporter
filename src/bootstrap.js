/* Require Modules */
// 3rd party modules
const fs = require('fs')
const execSync = require('child_process').execSync

// Configurations
const general_prop = require(__dirname + '/config/general_prop.js')(
  process.env.NODE_ENV
)
const log_prop = require(__dirname + '/config/log_prop.js')
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
 * Function which initialize the caching.
 * This includes to create the cache directory if it does not exist so far.
 */
const initCache = env => {
  if (!fs.existsSync(general_prop.cacheFolder)) {
    console.log('Initialize cache directory...')
    fs.mkdirSync(general_prop.cacheFolder)
  }
}

/**
 * Function which initialize the logging.
 * By this it read in the logging configuration and check if every necessary file  object exist.
 * In case everything is already fine, this function does nothing.
 */
const initLogging = () => {
  // Create the folder for all log files, if it does not exit yet.
  if (!fs.existsSync(log_prop.path_dir)) {
    console.log('Initialize the logging directory...')
    fs.mkdirSync(log_prop.path_dir)
  }

  // Iterate over all defined log files and create them if necessary.
  for (let file in log_prop.path_files) {
    const logFile = log_prop.path_files[file]

    // Check if this file already exist.
    if (!fs.existsSync(logFile)) {
      console.log('Create log file for ' + file)
      fs.closeSync(fs.openSync(logFile, 'w'))
    }
  }
}

/**
 * Function which initialize the SSL base.
 * This includes to check if the SSL key and certificate exist, which are
 * required by the HTTPS protocol for the server.
 * If not so, the user gets informed about that.
 * In case the server has been started in development environment, both files
 * get generated automatically.
 * In case everything is already fine, this function does nothing.
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
  initCache: initCache,
  initLogging: initLogging,
  initSSL: initSSL
}
