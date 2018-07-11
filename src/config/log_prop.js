/* Properties */
// The base directory for all log files.
const path_dir = __dirname + '/../../log'

// Object with the file names for each used log.
const path_files = {
  connections: path_dir + '/connections.log'
}

const options_bunyan = {
  name: 'connections',
  level: 'info',
  streams: [
    {
      type: 'rotating-file',
      level: 'trace',
      period: '1d',
      count: 14,
      path: path_files.connections
    }
  ]
}

// Define what will be exported.
module.exports = {
  // Paths
  path_dir: path_dir,
  path_files: path_files,

  // Options
  options_bunyan: options_bunyan
}
