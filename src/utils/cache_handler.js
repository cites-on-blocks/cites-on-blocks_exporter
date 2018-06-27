/* Import Modules */
// 3rd party modules
const fs = require('fs')
const path = require('path')

// Own
const logger = require(__dirname + '/../logger.js').logger // To log information persistently.
const general_prop = require(__dirname + '/../config/general_prop.js')(
  process.env.NODE_ENV
) // To get the configured cache folder.
const conversion_types = require(__dirname +
  '/../constants/conversion_types.js') // The list of types a permit can get converted to.
const blockchainObject = require(__dirname +
  '/../constants/blockchainObjects.js') // Split the cache for each object.

/* Properties */

const EXTENSION_MAPPING = Object.freeze({
  [conversion_types.XML]: 'xml',
  [conversion_types.PDF]: 'pdf'
})

/* Utilities */

/**
 * Build the path for a blockchain object with its identifier and a specific conversion type.
 * Used to have a single point to define the path for saving and reading.
 * Use the conversion type to get the file type extension.
 *
 * @param object      - type of the blockchain object
 * @param identifier  - identifier of the blockchain object
 * @param conversion  - conversion type of the file in cache
 *
 * @return path where to save/search the object
 */
async function getPath(object, identifier, conversion) {
  // Construct the path for the file how it should (have) be(en) stored.
  const extension = EXTENSION_MAPPING[conversion]
  return (
    general_prop.cacheFolder + '/' + object + '/' + identifier + '.' + extension
  )
}

/**
 * Take a path and make sure to create all sub directory which does not exist already.
 * Does nothing if the whole paths folder hierarchy exist.
 *
 * @param path  - path to check
 */
async function createCachePath(pathToCheck) {
  const initialDirectory = path.isAbsolute(pathToCheck) ? path.sep : ''

  pathToCheck.split(path.sep).reduce((parentDirectory, childDirectory) => {
    // Take the next directory in the hierarchy.
    const currentDirectory = path.resolve('.', parentDirectory, childDirectory)

    try {
      fs.mkdirSync(currentDirectory)
    } catch (err) {
      if (err.code !== 'EEXIST') {
        throw err
      }

      // Else the directory already exists.
    }

    return currentDirectory
  }, initialDirectory)

  // Return statement to get a promise.
  return
}

/* Functions */

/**
 * Check the cache if an already converted object file can be found for
 * this identifier and any known type.
 * Return an object with the keys as the types and the values are the file
 * paths.
 * If a file couldn't be found for specific type, the value is 'undefined'.
 *
 * @param object     - type of the blockchain object
 * @param identifier - identifier of the object to check
 *
 * @return conversion type to file path mapping
 */
const getObject = async (object, identifier) => {
  logger.info('Search in cache for ' + object + ' with ID: ' + identifier)

  // Initialize mapping and start searching for each conversion type.
  let mapping = {}

  for (let i in conversion_types) {
    // Get the path where to search for the permit.
    const type = conversion_types[i]
    const pathToSearch = await getPath(object, identifier, type)

    // Check if the file exist.
    if (fs.existsSync(pathToSearch)) {
      mapping[type] = pathToSearch
      logger.info('Found cached file: ' + pathToSearch)
    } else {
      mapping[type] = undefined
    }
  }

  return mapping
}

/**
 * Cache the object for a specific conversion type.
 * Can be retrieved again by the get function.
 * The content parameter must have the correct JS type for the specified
 * conversion type.
 * Cause this function is meant to be not waiting for, an exception doesn't
 * make sense here, cause a try-catch block is useless.
 * In case anyone should, it returns an Boolean, if it was successful.
 *
 * @param object      - type of the blockchain object
 * @param identifier  - identifier of the object to check
 * @param content     - the information to store for that object
 * @param conversion  - conversion type that gets cached
 *
 * @return true  - if caching was successful
 *         false - else
 */
const cacheObject = async (object, identifier, content, conversion) => {
  logger.info(
    'Cache ' +
      object +
      ' with ID ' +
      identifier +
      ' for conversion type ' +
      conversion
  )
  // Get the path where to store the file.
  const pathToStore = await getPath(object, identifier, conversion)

  // Make sure all folders exist for this path.
  const pathDirsOnly = pathToStore.substring(
    0,
    pathToStore.lastIndexOf(path.sep)
  )

  await createCachePath(pathDirsOnly)

  // Differ the storage by the conversion type.
  switch (conversion) {
    case conversion_types.XML:
      // Object object must be pure string by the XML conversion.
      if (typeof content !== 'string') {
        const err = new Error(
          'Caching an object in XML format require a string as input not ' +
            typeof conversion
        )
        logger.info(err)
        return false
      }

      await fs.writeFile(pathToStore, content)
      return true

    case conversion_types.PDF:
      const err = new Error('PDF caching is not supported so far!')
      logger.info(err)
      return false
  }
}

// Define what to export.
module.exports = {
  getObject: getObject,
  cacheObject: cacheObject
}
