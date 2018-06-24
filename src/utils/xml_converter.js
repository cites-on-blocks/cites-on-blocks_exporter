/* Import Modules */
// 3rd party modules
const xml = require('xml-js')

// Own
const logger = require(__dirname + '/../logger.js').logger // To log information persistently.
const xmlPropertyKeys = require(__dirname + '/../constants/xmlPropertyKeys.js')
const general_prop = require(__dirname + '/../config/general_prop.js')(
  process.env.NODE_ENV
)

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

/* Functions */

const convertPermitToXml = async function(id, object) {
  logger.info('Convert a permit to XML.')

  // Build a modified JSON by the original one.
  let convertedJson = {}
  convertedJson._attributes = { id: id }
  convertedJson[xmlPropertyKeys.EXPORT_COUNTRY] = await hex2String(object[0])
  convertedJson[xmlPropertyKeys.IMPORT_COUNTRY] = await hex2String(object[1])

  // Convert it to JSON (mark that this require a single top property).
  const wrapperJson = { permit: convertedJson }
  const xmlPermit = xml.json2xml(wrapperJson, general_prop.xmlConverterConfig)

  // Log and return.
  logger.info('Conversion done:' + JSON.stringify(xmlPermit))
  return xmlPermit
}

// Define what to export.
module.exports = {
  convertPermitToXml: convertPermitToXml
}
