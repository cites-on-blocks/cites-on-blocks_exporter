/* Load Modules */
// 3rd party modules
const router = require('koa-router') // The parent object for the router.

// Own
const logger = require(__dirname + '/../logger.js').logger // To log informations persistently.
const routeNames = require(__dirname + '/../constants/routeNames.js') // The names of the routes of this router as enumeration.
const arguments = require(__dirname + '/../constants/arguments.js') // The argument identifier used for the routes in this router.

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

  // Dummy value to simulate a decision.
  // TODO: Real check for the permit on the blockchain.
  const valid = true

  if (valid) {
    // TODO: Check if a converted XML already exist.
    ctx.permit = 'this should be the correct path later on'
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
    logger.info('Permit ID is: ' + ctx.params[arguments.PERMIT_ID])

    // Check if the permit does already exist in XML form.
    // This could has been added by the parameter check function.
    if (ctx.permit) {
      ctx.body = ctx.permit
    } else {
      // TODO: Convert the permit to XML here.
      ctx.body = 'Fake XML'
    }

    ctx.status = 200
  }
)

// Define what should be exported.
module.exports = exportRouter
