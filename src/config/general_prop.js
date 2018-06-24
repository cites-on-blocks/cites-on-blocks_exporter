// Properties which are constant trough the environments.
const xmlConverterConfig = {
  compact: true,
  ignoreComment: true,
  spaces: 4
}

const cacheFolder = __dirname + '/../../cache'

// Overall properties object.
const props = {
  development: {
    port_http: 8080,
    port_https: 8081,
    eth_provider: 'http://localhost:8545',
    xmlConverterConfig: xmlConverterConfig,
    cacheFolder: cacheFolder
  },

  production: {
    port_http: 80,
    port_https: 443,
    eth_provider: undefined, // TODO: Define the productive network provider.
    xmlConverterConfig: xmlConverterConfig,
    cacheFolder: cacheFolder
  }
}

// Define what will be exported.
module.exports = function(env) {
  return props[env]
}
