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
 *
 * @param   permitId - string as the identifier of the permit
 * @return  permit   - object as the permit itself or 'undefined'
 */
const getPermitById = async permitId => {
  logger.info('Search for permit with ID: ' + permitId)

  // Try to get the permit from the contract.
  try {
    const permit = await permitFactoryContract.getPermit(permitId)
    logger.info('Permit could been found for this ID.')
    return permit
  } catch (err) {
    logger.info('No permit could been found for this ID!')
    return undefined
  }
}

/**
 * Search for a specimen defined by its given identifier in the contract.
 * If the specified specimen does exist, it returns the whole specimen object.
 * Else 'undefined' is the response.
 *
 * @param   specimenId - string as the identifier of the specimen
 * @return  specimen   - object as the specimen itself or 'undefined'
 */
const getSpecimenById = async specimenId => {
  logger.info('Search for specimen with ID: ' + specimenId)

  // Try to get the specimen from the contract.
  try {
    const specimen = await permitFactoryContract.getSpecimen(specimenId)
    logger.info('Specimen could been found for this ID.')
    return specimen
  } catch (err) {
    logger.info('No specimen could been found for this ID!')
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
    logger.info('Permit processed flag has been returned.')
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
  getPermitById: getPermitById,
  getSpecimenById: getSpecimenById,
  isPermitProcessed: isPermitProcessed,
  isPermitAccepted: isPermitAccepted
}
