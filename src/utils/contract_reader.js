/* Import Modules */
// 3rd party modules
const Web3 = require('web3')

// Own
const logger = require(__dirname + '/../logger.js').logger
const contractNames = require(__dirname + '/../constants/contractNames.js')
const contract_prop = require(__dirname + '/../config/contract_prop.js')
const general_prop = require(__dirname + '/../config/general_prop.js')(
  process.env.NODE_ENV
)

/* Connectivity */

const web3 = new Web3(
  new Web3.providers.HttpProvider(general_prop.eth_provider)
)
const permitFactoryInfo = contract_prop[contractNames.PERMIT_FACTORY]

let permitFactoryContract = web3.eth.contract(permitFactoryInfo.abi)
permitFactoryContract = permitFactoryContract.at(permitFactoryInfo.address)

/* Functions */

/**
 * Search for a permit defined by its given identifier in the contract.
 * If the specified permit does exist, it returns the whole permit object.
 * Else 'undefined' is the response.
 * This functions also meant for the purpose to check if the identifier is
 * an existing one.
 *
 * @param   permitId - string as the identifier of the permit
 * @return  permit   - object as the permit itself or 'undefined'
 */
const getPermitById = async function(permitId) {
  logger.info('Search for permit with ID: ' + permitId)

  try {
    // Try to get the permit from the contract.
    const permit = await permitFactoryContract.permits(permitId)

    // Check if this is an 'empty' permit.
    if (
      permit.exportCountry === '0x0000' &&
      permit.importCountry === '0x0000'
    ) {
      logger.info('No permit could been found for this ID.')
      return undefined
    } else {
      logger.info('Permit could been found for this ID.')
      return permit
    }
  } catch (err) {
    logger.info('Something went wrong while try to get the permit.')
    logger.info(err)
    throw err
  }
}

module.exports = {
  getPermitById: getPermitById
}
