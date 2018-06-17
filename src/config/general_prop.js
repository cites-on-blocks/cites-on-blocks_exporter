// Overall properties object.
const props = {
  development: {
    port_http: 8080,
    port_https: 8081,
    eth_provider: 'http://localhost:8545'
  },

  production: {
    port_http: 80,
    port_https: 443,
    eth_provider: undefined // TODO: Define the productive network provider.
  }
}

// Define what will be exported.
module.exports = function(env) {
  return props[env]
}
