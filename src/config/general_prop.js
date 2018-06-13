// Overall properties object.
const props = {
  development: {
    port_http: 8080,
    port_https: 8081
  },

  production: {
    port_http: 80,
    port_https: 443
  }
}

// Define what will be exported.
module.exports = function(env) {
  return props[env]
}
