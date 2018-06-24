/* Load Modules */
// 3rd party modules
const router = require('koa-router') // The parent object for the router.

// Own
const logger = require(__dirname + '/../logger.js').logger // To log information persistently.
const routeNames = require(__dirname + '/../constants/routeNames.js') // The names of the routes of this router as enumeration.
const arguments = require(__dirname + '/../constants/arguments.js') // The argument identifier used for the routes in this router.
const contractReader = require(__dirname + '/../utils/contract_reader.js') // To read data on the blockchain.
const xmlConverter = require(__dirname + '/../utils/xml_converter.js') // To convert blockchain data to XML representational strings.

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

  // TODO: Check if a converted XML already exist.

  // Try to get the permit from the blockchain.
  try {
    ctx.permit = {}
    ctx.permit.json = await contractReader.getPermitById(id)
  } catch (err) {
    logger.info(
      "Can't verify permit ID. Must response with server internal error code."
    )
    ctx.status = 500
    return
  }

  // Check if the permit has been found or not.
  // The permit identifier exists, if a object as permit exists.
  if (ctx.permit.json) {
    return next()
  } else {
    const message = 'The given permit ID (' + id + ') does not exist!'
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
  '/:' + arguments.PERMIT_ID,
  async (ctx, next) => {
    logger.info('Export an permit as XML.')

    // Check if the permit does already exist in XML form.
    // This could has been added by the parameter check function.
    if (ctx.permit && ctx.permit.xml) {
      ctx.body = ctx.permit
      ctx.status = 200
    } else if (ctx.permit && ctx.permit.json) {
      // TODO: Convert the permit to XML here.
      ctx.body = await xmlConverter.convertPermitToXml(
        ctx.params[arguments.PERMIT_ID],
        ctx.permit.json
      )
      ctx.type = 'text/xml'
      ctx.status = 200
    } else {
      logger.info(
        'The context property for the permit does not exist! Must response server internal error code.'
      )
      ctx.status = 500
    }
  }
)

// Define what should be exported.
module.exports = exportRouter
