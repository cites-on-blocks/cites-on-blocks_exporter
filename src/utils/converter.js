/* Import Modules */
// 3rd party modules
const xml = require('xml-js')

// Own
const logger = require(__dirname + '/../logger.js').logger // To log information persistently.
const general_prop = require(__dirname + '/../config/general_prop.js')(
  process.env.NODE_ENV
)
const conversion_types = require(__dirname +
  '/../constants/conversion_types.js') // To specify to what type to convert.
const xmlPropertyKeys = require(__dirname + '/../constants/xmlPropertyKeys.js')
const contract_reader = require(__dirname + '/contract_reader.js')
const blockchainObjects = require(__dirname +
  '/../constants/blockchainObjects.js')

/* Utilities */

/**
 * Parse a hexadecimal string to a ASCII string.
 *
 * @param  hex - the hexadecimal string
 *
 * @return converted string in ASCII
 */
async function hex2String(hex) {
  // Check if everything is alright.
  if (!hex) {
    return ''
  } else {
    let string = ''

    // Parse each tuple to ASCII.
    for (let i = 0; i < hex.length; i += 2) {
      string += String.fromCharCode(parseInt(hex.substr(i, 2), 16))
    }

    return string
  }
}

/**
 * Restructure a permit into standard format.
 * The permit is defined by a given identifier and its describing object in JSON.
 *
 * @param permitId      - identifier of the permit to convert
 * @param permitObject  - object of the permit to convert
 *
 * @return restructured permit
 */
async function restructurePermitToStandardFormat(permitId, permitObject) {
  logger.info(
    'Restructure a permit to standard format with identifier: ' + permitId
  )

  // Build a modified JSON by the original one.
  let restructuredPermit = {}

  // Flags
  restructuredPermit[
    xmlPropertyKeys.PERMIT.PROCESSED
  ] = await contract_reader.isPermitProcessed(permitId)

  restructuredPermit[
    xmlPropertyKeys.PERMIT.ACCEPTED
  ] = await contract_reader.isPermitAccepted(permitId)

  // Header with ID and type.
  let header = (restructuredPermit[xmlPropertyKeys.HEADER.BASE] = {})
  header[xmlPropertyKeys.HEADER.ID] = permitId
  header[xmlPropertyKeys.HEADER.TYPE] = permitObject[2].toString()

  // Consignment
  let consignment = (restructuredPermit[xmlPropertyKeys.CONSIGNMENT.BASE] = {})

  // Exporter
  let consignor = (consignment[xmlPropertyKeys.CONSIGNMENT.CONSIGNOR] = {})
  consignor[xmlPropertyKeys.PARTICIPANT.NAME] = await hex2String(
    permitObject[3][0]
  )

  let consignorAddress = (consignor[
    xmlPropertyKeys.PARTICIPANT.ADDRESS.BASE
  ] = {})

  consignorAddress[
    xmlPropertyKeys.PARTICIPANT.ADDRESS.STREET
  ] = await hex2String(permitObject[3][1])

  consignorAddress[xmlPropertyKeys.PARTICIPANT.ADDRESS.CITY] = await hex2String(
    permitObject[3][2]
  )

  consignorAddress[
    xmlPropertyKeys.PARTICIPANT.ADDRESS.COUNTRY
  ] = await hex2String(permitObject[0])

  // Importer
  let consignee = (consignment[xmlPropertyKeys.CONSIGNMENT.CONSIGNEE] = {})
  consignee[xmlPropertyKeys.PARTICIPANT.NAME] = await hex2String(
    permitObject[4][0]
  )

  let consigneeAddress = (consignee[
    xmlPropertyKeys.PARTICIPANT.ADDRESS.BASE
  ] = {})

  consigneeAddress[
    xmlPropertyKeys.PARTICIPANT.ADDRESS.STREET
  ] = await hex2String(permitObject[4][1])

  consigneeAddress[xmlPropertyKeys.PARTICIPANT.ADDRESS.CITY] = await hex2String(
    permitObject[4][2]
  )

  consigneeAddress[
    xmlPropertyKeys.PARTICIPANT.ADDRESS.COUNTRY
  ] = await hex2String(permitObject[1])

  // Specimens
  let specimens = (consignment[xmlPropertyKeys.CONSIGNMENT.SPECIMENS] = {})
  specimens[xmlPropertyKeys.SPECIMEN.BASE] = []

  for (let i in permitObject[5]) {
    // Get the specimen of this index by its ID, convert and add it to the list.
    const specimenId = permitObject[5][i]
    const specimenObject = await contract_reader.getObjectById(
      blockchainObjects.SPECIMEN,
      specimenId
    )
    const specimen = await restructureSpecimenToStandardFormat(
      specimenId,
      specimenObject,
      true
    )

    specimens[xmlPropertyKeys.SPECIMEN.BASE].push(specimen)
  }

  // Put this into a big outer tag (do it here to save code above).
  const standardFormat = { [xmlPropertyKeys.PERMIT.BASE]: restructuredPermit }

  // Log and return.
  logger.info('Restructuring done.')
  return standardFormat
}

/**
 * Restructure a specimen into standard format.
 * The specimen is defined by a given identifier and its describing object in JSON.
 * For use it in a permit, the embedded flag needs to be set.
 *
 * @param specimenId     - identifier of the specimen to convert
 * @param specimenObject - object of the specimen to convert
 * @param embedded       - do not use an outer tag to embed it.
 *
 * @return restructured specimen
 */
async function restructureSpecimenToStandardFormat(
  specimenId,
  specimenObject,
  embedded
) {
  logger.info(
    'Restructure a specimen to standard format with ID: ' + specimenId
  )

  // Build a modified JSON by the original one.
  let restructuredSpecimen = {}

  // ID, origin- and re-export hashes.
  restructuredSpecimen[xmlPropertyKeys.SPECIMEN.ID] = specimenId
  restructuredSpecimen[xmlPropertyKeys.SPECIMEN.ORIGIN_HASH] = specimenObject[5]
  restructuredSpecimen[xmlPropertyKeys.SPECIMEN.RE_EXPORT_HASH] =
    specimenObject[6]

  // Transport
  let transport = (restructuredSpecimen[
    xmlPropertyKeys.SPECIMEN.TRANSPORT.BASE
  ] = {})

  transport[
    xmlPropertyKeys.SPECIMEN.TRANSPORT.QUANTITY
  ] = specimenObject[1].toString()

  // Item & Product
  let item = (restructuredSpecimen[xmlPropertyKeys.SPECIMEN.ITEM.BASE] = {})
  let product = (item[xmlPropertyKeys.SPECIMEN.ITEM.PRODUCT.BASE] = {})
  product[xmlPropertyKeys.SPECIMEN.ITEM.PRODUCT.DESCRIPTION] = await hex2String(
    specimenObject[4]
  )

  product[xmlPropertyKeys.SPECIMEN.ITEM.PRODUCT.COMMON_NAME] = await hex2String(
    specimenObject[3]
  )

  product[
    xmlPropertyKeys.SPECIMEN.ITEM.PRODUCT.SCIENTIFIC_NAME
  ] = await hex2String(specimenObject[2])

  // Check if this have to be put into an outer tag.
  let standardFormat

  if (embedded) {
    standardFormat = restructuredSpecimen
  } else {
    standardFormat = { [xmlPropertyKeys.PERMIT.BASE]: restructuredSpecimen }
  }

  // Log and return.
  logger.info('Restructuring done.')
  return standardFormat
}

/* Functions */

/**
 * Convert an blockchain object into a specified file type.
 * The object is defined by its identifier and object.
 * Before the obkect gets converted to the requested file type,
 * it gets restructured from blockchain into standard format.
 *
 * @param object        - type of the blockchain object
 * @param identifier    - identifier of the object
 * @param content       - content of the object
 * @param conversion    - file type for the conversion
 *
 * @return converted object
 */
const convertObject = async function(object, identifier, content, conversion) {
  // Choose the restructuring function for the object type.
  let restucturer

  switch (object) {
    case blockchainObjects.PERMIT:
      restucturer = restructurePermitToStandardFormat
      break

    case blockchainObjects.SPECIMEN:
      restucturer = restructureSpecimenToStandardFormat
      break
  }

  // Choose the conversion function by the conversion typpe.
  switch (conversion) {
    case conversion_types.XML:
      const standardFormat = await restucturer(identifier, content)
      return xml.json2xml(standardFormat, general_prop.xmlConverterConfig)

    case conversion_types.PDF:
      throw new Error('PDF conversion is not supported so far!')
  }
}

// Define what to export.
module.exports = {
  convertObject: convertObject
}
