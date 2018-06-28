/* Import Modules */
// 3rd party modules
const Web3 = require('web3')

// Own
const logger = require(__dirname + '/../logger.js').logger
const contractNames = require(__dirname + '/../constants/contractNames.js')
const contract_prop = require(__dirname + '/../config/contract_prop.js')
const blockchainObjects = require(__dirname +
  '/../constants/blockchainObjects.js')
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
 * Search for an object defined by its given identifier on the blockchain.
 * If the specified object does exist, it returns the whole response.
 * Else 'undefined' is returned.
 *
 * @param oject      - type of the blockchain object
 * @param identifier - identifier of the object
 *
 * @return content of the object on the blockchain
 */
const getObjectById = async (object, identifier) => {
  logger.info('Search for ' + object + ' with identifier: ' + identifier)

  // Choose the correct function to access the object on the blockchain.
  let getter

  switch (object) {
    case blockchainObjects.PERMIT:
      getter = permitFactoryContract.getPermit
      break

    case blockchainObjects.SPECIMEN:
      getter = permitFactoryContract.getSpecimen
      break
  }

  // Try to get the object from the blockchain.
  try {
    const content = await getter.call(identifier)
    logger.info('The ' + object + ' could been found for this identifier.')
    return content
  } catch (err) {
    logger.info('No ' + object + ' could been found for this identifier!')
    return undefined
  }
}

/**
 * Get the processed flag for a permit defined by its given identifier in the contract.
 * In case some serious issue has occurred, 'undefined' gets returned.
 *
 * @param   permitId  - string as the identifier of the permit
 * @return  processed - value of the processed flag for the permit or 'undefined'
 */
const isPermitProcessed = async permitId => {
  logger.info('Check for processed flag for permit with ID: ' + permitId)

  // Try to get the processed flag from the contract for this permit.
  try {
    const processed = await permitFactoryContract.confirmed(permitId)
    logger.info('Permit processed flag has been returned: ' + processed)
    return processed
  } catch (err) {
    logger.info('No processed flag could been found!')
    return undefined
  }
}

/**
 * Get the accepted flag for a permit defined by its given identifier in the contract.
 * In case some serious issue has occurred, 'undefined' gets returned.
 *
 * @param   permitId - string as the identifier of the permit
 * @return  accepted - value of the accepted flag for the permit or 'undefined'
 */
const isPermitAccepted = async permitId => {
  logger.info('Check for accepted flag for permit with ID: ' + permitId)

  // Try to get the accepted flag from the contract for this permit.
  try {
    const accepted = await permitFactoryContract.accepted(permitId)
    logger.info('Permit accepted flag has been returned.')
    return accepted
  } catch (err) {
    logger.info('No accepted flag could been found!')
    return undefined
  }
}

// Define what will be exported.
module.exports = {
  getObjectById: getObjectById,
  isPermitProcessed: isPermitProcessed,
  isPermitAccepted: isPermitAccepted
}
