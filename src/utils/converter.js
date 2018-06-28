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
  logger.info('Restructure a permit to standard format with ID: ' + permitId)

  // Build a modified JSON by the original one.
  let restructuredPermit = {}
  restructuredPermit._attributes = { id: permitId }

  // Export/Import Country
  restructuredPermit[xmlPropertyKeys.PERMIT.EXPORT_COUNTRY] = await hex2String(
    permitObject[0]
  )

  restructuredPermit[xmlPropertyKeys.PERMIT.IMPORT_COUNTRY] = await hex2String(
    permitObject[1]
  )

  // Permit Type
  restructuredPermit[xmlPropertyKeys.PERMIT.TYPE] = permitObject[2].toString()

  // Importer
  restructuredPermit[xmlPropertyKeys.PERMIT.IMPORTER] = {}
  restructuredPermit[xmlPropertyKeys.PERMIT.IMPORTER][
    xmlPropertyKeys.PARTICIPANT.NAME
  ] = await hex2String(permitObject[3][0])

  restructuredPermit[xmlPropertyKeys.PERMIT.IMPORTER][
    xmlPropertyKeys.PARTICIPANT.STREET
  ] = await hex2String(permitObject[3][1])

  restructuredPermit[xmlPropertyKeys.PERMIT.IMPORTER][
    xmlPropertyKeys.PARTICIPANT.CITY
  ] = await hex2String(permitObject[3][2])

  // Exporter
  restructuredPermit[xmlPropertyKeys.PERMIT.EXPORTER] = {}
  restructuredPermit[xmlPropertyKeys.PERMIT.EXPORTER][
    xmlPropertyKeys.PARTICIPANT.NAME
  ] = await hex2String(permitObject[4][0])

  restructuredPermit[xmlPropertyKeys.PERMIT.EXPORTER][
    xmlPropertyKeys.PARTICIPANT.STREET
  ] = await hex2String(permitObject[4][1])

  restructuredPermit[xmlPropertyKeys.PERMIT.EXPORTER][
    xmlPropertyKeys.PARTICIPANT.CITY
  ] = await hex2String(permitObject[4][2])

  // Processed & Accepted Flags
  restructuredPermit[
    xmlPropertyKeys.PERMIT.PROCESSED
  ] = await contract_reader.isPermitProcessed(permitId)

  restructuredPermit[
    xmlPropertyKeys.PERMIT.ACCEPTED
  ] = await contract_reader.isPermitAccepted(permitId)

  // Specimens
  restructuredPermit[xmlPropertyKeys.PERMIT.SPECIMENS] = {}
  restructuredPermit[xmlPropertyKeys.PERMIT.SPECIMENS][
    xmlPropertyKeys.SPECIMEN.BASE
  ] = []

  for (let i in permitObject[5]) {
    // Get the specimen of this index by its ID, convert and add it to the list.
    const specimenId = permitObject[5][i]
    const specimenObject = await contract_reader.getObjectById(
      blockchainObject.SPECIMEN,
      specimenId
    )
    const specimen = await restructureSpecimenToStandardFormat(
      specimenId,
      specimenObject,
      true
    )

    restructuredPermit[xmlPropertyKeys.PERMIT.SPECIMENS][
      xmlPropertyKeys.SPECIMEN.BASE
    ].push(specimen)
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
  restructuredSpecimen._attributes = { id: specimenId }

  // Permit Hash & Quantity
  restructuredSpecimen[xmlPropertyKeys.SPECIMEN.PERMIT_ID] = specimenObject[0]
  restructuredSpecimen[
    xmlPropertyKeys.SPECIMEN.QUANTITY
  ] = specimenObject[1].toString()

  // Names & Description
  restructuredSpecimen[
    xmlPropertyKeys.SPECIMEN.SCIENTIFIC_NAME
  ] = await hex2String(specimenObject[2])
  restructuredSpecimen[xmlPropertyKeys.SPECIMEN.COMMON_NAME] = await hex2String(
    specimenObject[3]
  )
  restructuredSpecimen[xmlPropertyKeys.SPECIMEN.DESCRIPTION] = await hex2String(
    specimenObject[4]
  )

  // Origin & Re-Export Hashes
  restructuredSpecimen[xmlPropertyKeys.SPECIMEN.ORIGIN_HASH] = await hex2String(
    specimenObject[5]
  )
  restructuredSpecimen[
    xmlPropertyKeys.SPECIMEN.RE_EXPORT_HASH
  ] = await hex2String(specimenObject[6])

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
