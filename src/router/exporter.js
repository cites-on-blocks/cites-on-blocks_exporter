/* Load Modules */
// 3rd party modules
const router = require('koa-router') // The parent object for the router.
const fs = require('fs') // To read cached permit files.

// Own
const logger = require(__dirname + '/../logger.js').logger // To log information persistently.
const routeNames = require(__dirname + '/../constants/routeNames.js') // The names of the routes of this router as enumeration.
const arguments = require(__dirname + '/../constants/arguments.js') // The argument identifier used for the routes in this router.
const contractReader = require(__dirname + '/../utils/contract_reader.js') // To read data on the blockchain.
const converter = require(__dirname + '/../utils/converter.js') // To convert blockchain data to XML representational strings.
const cacheHandler = require(__dirname + '/../utils/cache_handler.js') // Get access to the cached converted permit files.
const blockchainObjects = require(__dirname +
  '/../constants/blockchainObjects.js') // Differ between the different object in the blockchain.
const conversion_types = require(__dirname +
  '/../constants/conversion_types.js') // The list of types a permit can get converted to.

/* Initialize the router */
const exportRouter = new router()
exportRouter.prefix('/api')

/* Define Parameters */

/**
 * Check the argument for the blockchain object type.
 * Make sure only supported objects can be requested.
 *
 * @codes
 *  400 - Blockchain object type is not supported
 */
exportRouter.param(
  arguments.BLOCKCHAIN_OBJECT_TYPE,
  async (object, ctx, next) => {
    // Check for each of known object type if it fits.
    for (let i in blockchainObjects) {
      if (blockchainObjects[i] === object) {
        // Everything fine, so so further.
        logger.info('Requested valid blockchain type: ' + object)
        return next()
      }
    }

    // Provided blockchain object type is not supported.
    const message =
      'The requested blockchain object type (' + object + ') is not supported!'
    logger.info(message)
    ctx.body = message
    ctx.status = 400
  }
)

/**
 * Validate the argument for the object identifier.
 * Check if a object with this identifier exist on the blockchain.
 * If so check if converted file for this object has been already generated
 * and attach it for the next middleware functions.
 *
 * @codes
 *  404 - Object with this identifier does not exist on the blockchain
 */
exportRouter.param(
  arguments.OBJECT_IDENTIFIER,
  async (identifier, ctx, next) => {
    // Store this parameter here, cause we will need it a lot.
    const object = ctx.params[arguments.BLOCKCHAIN_OBJECT_TYPE]

    logger.info('URL parameter validation for object identifier.')
    logger.info('Verify the identifier: ' + identifier + ' for a ' + object)

    // Try to get the object from the blockchain.
    ctx[object] = {}
    ctx[object].json = await contractReader.getObjectById(object, identifier)

    // Check if the object has been found or not.
    // The object exists if some content has been found on the blockchain.
    if (ctx[object].json) {
      // Try to get already converted object files which has get cached.
      ctx[object].cache = await cacheHandler.getObject(object, identifier)
      return next()
    } else {
      const message =
        'The given identifier (' +
        identifier +
        ') does not exist for a ' +
        object +
        '!'
      logger.info(message)
      ctx.body = message
      ctx.status = 404
    }
  }
)

/* Define Methods */

/**
 * Router function to export convert an object from the blockchain.
 * Expect the blockchain object type and its identifier as path argument.
 * The conversion type can be specified by the query parameter 'conversion'.
 * If none is given, XML is used per default.
 * In case no conversion file already exist, it generates one and respond it.
 *
 * @codes
 *  200 - Object conversion file already exist and gets responded
 *  201 - Object has exported and converted new before responded
 *  400 - If the defined conversion type is not supported
 */
exportRouter.get(
  routeNames.BLOCKCHAIN_OBJECT_EXPORT,
  '/:' + arguments.BLOCKCHAIN_OBJECT_TYPE + '/:' + arguments.OBJECT_IDENTIFIER,
  async (ctx, next) => {
    logger.info('Export and convert an blockchain object.')

    // Store these parameter here, cause we will need it a lot.
    const object = ctx.params[arguments.BLOCKCHAIN_OBJECT_TYPE]
    const identifier = ctx.params[arguments.OBJECT_IDENTIFIER]
    const responseType = 'text/xml'

    // Define the conversion file type by query parameter or fallback.
    let conversion = ctx.request.query[arguments.CONVERSION_TYPE]

    if (conversion) {
      // Check if the defined type is a supported one.
      let valid = false

      for (let i in conversion_types) {
        // Check if this type fits, if no type has fit before.
        if (!valid && conversion_types[i] === conversion) {
          valid = true
        }
      }

      // End here with an error response if not have a valid type.
      if (!valid) {
        const message =
          'The defined conversion type (' + conversion + ') is not supported!'
        logger.info(message)
        ctx.body = message
        ctx.status = 400
        return next()
      }
    } else {
      // Fall back to default.
      conversion = conversion_types.XML
    }

    // Check if the object has been converted for this conversion type already.
    // This has been checked by the parameter checked and added if so.
    if (ctx[object] && ctx[object].cache && ctx[object].cache[conversion]) {
      // Read the cached file.
      logger.info('Load already converted file from the cache.')
      ctx.body = fs.readFileSync(ctx[object].cache[conversion])
      ctx.type = responseType
      ctx.status = 200
      return next()
    } else if (ctx[object] && ctx[object].json) {
      // Convert object to the requested type and cache it afterwards.
      logger.info('Must do a new conversion of this object.')
      try {
        const convertedContent = await converter.convertObject(
          object,
          identifier,
          ctx[object].json,
          conversion
        )

        cacheHandler.cacheObject(
          object,
          identifier,
          convertedContent,
          conversion
        ) // Don't wait for it until response.

        // Define the response.
        logger.info('Reponse with the new converted content of the object.')
        ctx.body = convertedContent
        ctx.type = responseType
        ctx.status = 200
      } catch (err) {
        // Internal error occurred while conversion or caching.
        logger.info(err)
        ctx.status = 500
        return next()
      }
    } else {
      logger.info(
        'The context property for the object does not exist! Must response server internal error code.'
      )
      ctx.status = 500
      return next()
    }
  }
)

// Define what should be exported.
module.exports = exportRouter
