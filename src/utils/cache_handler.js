/* Import Modules */
// 3rd party modules
const fs = require('fs')

// Own
const logger = require(__dirname + '/../logger.js').logger // To log information persistently.
const general_prop = require(__dirname + '/../config/general_prop.js')(
  process.env.NODE_ENV
) // To get the configured cache folder.
const conversion_types = require(__dirname +
  '/../constants/conversion_types.js') // The list of types a permit can get converted to.

/* Properties */

const extensionMapping = {
  [conversion_types.XML]: 'xml',
  [conversion_types.PDF]: 'pdf'
}

/* Utilities */

/**
 * Build the path for a permit and a specific conversion type.
 * Used to have a single point to define the path for saving and reading.
 * Use the conversion type to get the file type exentsion.
 *
 * @param permitId  - identifier of the permit
 * @param type      - conversion type
 *
 * @return path where to save/search the permit
 */
async function getPath(permitId, type) {
  // Construct the path for the file how it should (have) be(en) stored.
  const extension = extensionMapping[type]
  return general_prop.cacheFolder + '/' + permitId + '.' + extension
}

/* Functions */

/**
 * Check the cache folder if an already converted permit file can be found for
 * any known type.
 * Return an object with the keys as the types and the values are the file
 * paths.
 * If a file couldn't be found for specific type, the value is 'undefined'.
 *
 * @param permitId - identifier of the permit to check
 *
 * @return conversion type to file path mapping
 */
const getPermit = async permitId => {
  logger.info('Search in cache for permit with ID: ' + permitId)
  let mapping = {}

  for (let i in conversion_types) {
    // Get the path where to search for the permit.
    const type = conversion_types[i]
    const path = await getPath(permitId, type)
    logger.info('File: ' + path)

    // Check if the file exist.
    if (fs.existsSync(path)) {
      mapping[type] = path
      logger.info('Found cached file: ' + path)
    } else {
      mapping[type] = undefined
    }
  }

  return mapping
}

/**
 * Cache the permit for a specific type.
 * Can be retrieved again by the getPermit function.
 * The permitObject parameter must have the correct JS type for the specified
 * conversion type.
 * Cause this function is meant to be not waiting for, an exception doesn't
 * make sense here, cause a try-catch block is useless.
 * In case anyone should, it returns an Boolean, if it was successful.
 *
 * @param permitId      - identifier of the permit to cache
 * @param permitObject  - converted permit to store in cache
 * @param type          - conversion type that gets cached
 *
 * @return true  - if caching was successful
 *         false - else
 */
const cachePermit = async (permitId, permitObject, type) => {
  logger.info('Cache permit with ID ' + permitId + ' for type ' + type)
  // Get the path where to store the file.
  const path = await getPath(permitId, type)

  // Differ the storage by the conversion type.
  switch (type) {
    case conversion_types.XML:
      // Permit object must be pure string by the XML conversion.
      if (typeof permitObject !== 'string') {
        const err = new Error(
          'Caching an permit in XML format require a string as input not ' +
            typeof permitObject
        )
        logger.info(err)
        return false
      }

      await fs.writeFile(path, permitObject)
      return true

    case conversion_types.PDF:
      const err = new Error('PDF caching is not supported so far!')
      logger.info(err)
      return false
  }
}

// Define what to export.
module.exports = {
  getPermit: getPermit,
  cachePermit: cachePermit
}
