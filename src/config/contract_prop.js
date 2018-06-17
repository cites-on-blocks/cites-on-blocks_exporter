/* Import Modules */
// 3rd party modules
const fs = require('fs')

// Own
const logger = require(__dirname + '/../logger.js').logger
const contractNames = require(__dirname + '/../constants/contractNames.js')

/* Properties */
const dataFolder = __dirname + '/../../data/'

/* Utility Functions */

/**
 * Function to load a contract descriptive file.
 * The file is specified by its name.
 * and is expected to take place in a standardized directory.
 * The content can be parsed as JavaScript object with the optional argument.
 *
 * @param name - string as the name of the file
 * @param parse - boolean to define if the read content should be parsed as JSON
 *               optional and false per default
 *
 * @return content - the read file content, either parsed as object or plain text
 */
function readContractFile(name, parse = false) {
  logger.info('Parse JSON file file: ' + name)

  // Construct the path for the file.
  const path = dataFolder + name

  // Check a file with this path exists.
  if (!fs.existsSync(path)) {
    const message =
      'Could not find the following file, cause it does not exist: ' + path
    logger.err(message)
    throw new Error(message)
  }

  // Read in the file and parse if necessary.
  try {
    const content = fs.readFileSync(path, 'utf-8')
    return parse ? JSON.parse(content) : content
  } catch (err) {
    const message =
      'Something went while try to read/parse the following file: ' +
      path +
      '\n' +
      JSON.stringify(err)
    logger.err(message)
    throw new Error(message)
  }
}

/* Contracts */
const contracts = {
  [contractNames.PERMIT_FACTORY]: {
    address: readContractFile('PermitFactory.address').replace(/\n/gm, ''),
    abi: readContractFile('PermitFactory.json', true).abi
  }
}

// Define what will be exported.
module.exports = contracts
