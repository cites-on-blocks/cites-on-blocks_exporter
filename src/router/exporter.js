/* Load Modules */
// 3rd party modules
const router = require('koa-router') // The parent object for the router.
const fs = require('fs') // To read cached permit files.

// Own
const logger = require(__dirname + '/../logger.js').logger // To log information persistently.
const routeNames = require(__dirname + '/../constants/routeNames.js') // The names of the routes of this router as enumeration.
const routePaths = require(__dirname + '/../constants/routePaths.js') // The paths of the routes of this router.
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
 * Validate the argument for the permit ID.
 * Check if a permit with this ID exist on the blockchain.
 * If so check if a XML for this permit has been already generated and attach
 * it.
 *
 * @codes
 *  404 - Permit with this ID does not exist on the blockchain
 */
exportRouter.param(arguments.PERMIT_ID, async (id, ctx, next) => {
  logger.info('URL parameter validation for parameter _permitId_.')
  logger.info('Verify the ID: ' + id)

  // Try to get the permit from the blockchain.
  ctx.permit = {}
  ctx.permit.json = await contractReader.getPermitById(id)

  // Check if the permit has been found or not.
  // The permit identifier exists, if an object as permit exists.
  if (ctx.permit.json) {
    // Try to get already converted permit files which has get cached.
    ctx.permit.cache = await cacheHandler.getObject(
      blockchainObjects.PERMIT,
      id
    )
    return next()
  } else {
    const message = 'The given permit ID (' + id + ') does not exist!'
    logger.info(message)
    ctx.body = message
    ctx.status = 404
  }
})

/**
 * Validate the argument for the specimen ID.
 * Check if a specimen with this ID exist on the blockchain.
 * If so check if a XML for this permit has been already generated and attach
 * it.
 *
 * @codes
 *  404 - Specimen with this ID does not exist on the blockchain
 */
exportRouter.param(arguments.SPECIMEN_ID, async (id, ctx, next) => {
  logger.info('URL parameter validation for parameter _specimenId_.')
  logger.info('Verify the ID: ' + id)

  // Try to get the specimen from the blockchain.
  ctx.specimen = {}
  ctx.specimen.json = await contractReader.getSpecimenById(id)

  // Check if the specimen has been found or not.
  // The specimen identifier exists, if an object as permit exists.
  if (ctx.specimen.json) {
    // Try to get already converted permit files which has get cached.
    ctx.specimen.cache = await cacheHandler.getObject(
      blockchainObjects.SPECIMEN,
      id
    )
    return next()
  } else {
    const message = 'The given specimen ID (' + id + ') does not exist!'
    logger.info(message)
    ctx.body = message
    ctx.status = 404
  }
})

/* Define Methods */

/**
 * Router function to export an permit as XML file.
 * Expect the permits ID as path argument.
 * In case no XML file already exist, it generates one and respond it.
 *
 * @codes
 *  200 - Permit XML already exist and gets responded
 *  201 - Permit XML has been generated and responded
 */
exportRouter.get(
  routeNames.PERMIT_XML_EXPORT,
  routePaths.PERMIT_XML_EXPORT + '/:' + arguments.PERMIT_ID,
  async (ctx, next) => {
    logger.info('Export an permit as XML.')
    const responseType = 'text/xml'

    // Check if the permit does already exist for the conversion type.
    // This could has been added by the parameter check function.
    if (
      ctx.permit &&
      ctx.permit.cache &&
      ctx.permit.cache[conversion_types.XML]
    ) {
      // Read the cached file.
      logger.info('Load already converted file from the cache.')
      ctx.body = fs.readFileSync(ctx.permit.cache[conversion_types.XML])
      ctx.type = responseType
      ctx.status = 200
    } else if (ctx.permit && ctx.permit.json) {
      // Convert permit to XML and cache it afterwards.
      logger.info('Must do a new conversion of this permit.')
      const permitId = ctx.params[arguments.PERMIT_ID]
      const xml = await converter.convertPermit(
        permitId,
        ctx.permit.json,
        conversion_types.XML
      )
      cacheHandler.cacheObject(
        blockchainObjects.PERMIT,
        permitId,
        xml,
        conversion_types.XML
      ) // Don't wait for it until response.

      // Define the response.
      ctx.body = xml
      ctx.type = responseType
      ctx.status = 200
    } else {
      logger.info(
        'The context property for the permit does not exist! Must response server internal error code.'
      )
      ctx.status = 500
    }
  }
)

/**
 * Router function to export a specimen as XML file.
 * Expect the specimens ID as path argument.
 * In case no XML file already exist, it generates one and respond it.
 *
 * @codes
 *  200 - Specimen XML already exist and gets responded
 *  201 - Specimen XML has been generated and responded
 */
exportRouter.get(
  routeNames.SPECIMEN_XML_EXPORT,
  routePaths.SPECIMEN_XML_EXPORT + '/:' + arguments.SPECIMEN_ID,
  async (ctx, next) => {
    logger.info('Export an specimen as XML.')
    const responseType = 'text/xml'

    // Check if the specimen does already exist for the conversion type.
    // This could has been added by the parameter check function.
    if (
      ctx.specimen &&
      ctx.specimen.cache &&
      ctx.specimen.cache[conversion_types.XML]
    ) {
      // Read the cached file.
      logger.info('Load already converted file from the cache.')
      console.log(ctx.specimen.cache[conversion_types.XML])
      ctx.body = fs.readFileSync(ctx.specimen.cache[conversion_types.XML])
      ctx.type = responseType
      ctx.status = 200
    } else if (ctx.specimen && ctx.specimen.json) {
      // Convert specimen to XML and cache it afterwards.
      logger.info('Must do a new conversion of this specimen.')
      const specimenId = ctx.params[arguments.SPECIMEN_ID]
      const xml = await converter.convertSpecimen(
        specimenId,
        ctx.specimen.json,
        conversion_types.XML
      )
      cacheHandler.cacheObject(
        blockchainObjects.SPECIMEN,
        specimenId,
        xml,
        conversion_types.XML
      ) // Don't wait for it until response.

      // Define the response.
      ctx.body = xml
      ctx.type = responseType
      ctx.status = 200
    } else {
      logger.info(
        'The context property for the specimen does not exist! Must response server internal error code.'
      )
      ctx.status = 500
    }
  }
)

// Define what should be exported.
module.exports = exportRouter
