const { exec } = require('child_process')
let assert = require('assert')
const PERMIT_INFO = require('./constants/permit.js')
const fixString = require('./utils/hexStringFixer.js')
let CounterObject = require('./utils/counterObject.js')
const BC_OBJECTS = require('../src/constants/blockchainObjects.js')
const props = require('../src/config/general_prop.js')
const fs = require('fs')
const https = require('https') //import { parseString } from 'xml2js' doesn't work for some reason
const parseString = require('xml2js').parseString
let convert = require('xml-js')
let request = require('request')
let xmlPropertyKeys = require(__dirname +
  '/../src/constants/xmlPropertyKeys.js')

let agentOptions = {
  host: 'localhost',
  port: props('development').port_https,
  path: '/',
  rejectUnauthorized: false
}

let agent = new https.Agent(agentOptions)

describe('Optimal - Persons', function() {
  let permit = undefined

  let permitHash = ''
  let requestPath = ''

  before(function() {
    return new Promise(resolve => {
      permitHash = fs
        .readFileSync('./test/hashes/Permithash.hash')
        .toString('utf-8')
      requestPath =
        'https://localhost:' +
        props('development').port_https +
        '/api/' +
        BC_OBJECTS.PERMIT +
        '/' +
        permitHash
      request(
        {
          url: requestPath,
          method: 'GET',
          agent: agent
        },
        function(error, response, body) {
          if (error) {
            console.log(error)
          } else {
            parseString(body, (err, result) => {
              permit = result[xmlPropertyKeys.PERMIT.BASE]
              resolve()
            })
          }
        }
      )
    })
  })

  it('permit type should match', function() {
    assert.equal(
      permit[xmlPropertyKeys.HEADER.BASE][0][xmlPropertyKeys.HEADER.TYPE][0],
      PERMIT_INFO.permitType
    )
  })

  it('export country should match', function() {
    let exportCountry =
      permit[xmlPropertyKeys.CONSIGNMENT.BASE][0][
        xmlPropertyKeys.CONSIGNMENT.CONSIGNOR
      ][0][xmlPropertyKeys.PARTICIPANT.ADDRESS.BASE][0][
        xmlPropertyKeys.PARTICIPANT.ADDRESS.COUNTRY
      ][0]
    assert.equal(fixString(exportCountry.toString()), PERMIT_INFO.exportCountry)
  })

  it('import country should match', function() {
    let importCountry =
      permit[xmlPropertyKeys.CONSIGNMENT.BASE][0][
        xmlPropertyKeys.CONSIGNMENT.CONSIGNEE
      ][0][xmlPropertyKeys.PARTICIPANT.ADDRESS.BASE][0][
        xmlPropertyKeys.PARTICIPANT.ADDRESS.COUNTRY
      ][0]

    assert.equal(fixString(importCountry.toString()), PERMIT_INFO.importCountry)
  })

  it('importer name should match', function() {
    let importerName =
      permit[xmlPropertyKeys.CONSIGNMENT.BASE][0][
        xmlPropertyKeys.CONSIGNMENT.CONSIGNEE
      ][0][xmlPropertyKeys.PARTICIPANT.NAME][0]

    importerName = fixString(importerName.toString())
    assert.equal(importerName, PERMIT_INFO.importAddress[0])
  })

  it('importer street should match', function() {
    let importerStreet =
      permit[xmlPropertyKeys.CONSIGNMENT.BASE][0][
        xmlPropertyKeys.CONSIGNMENT.CONSIGNEE
      ][0][xmlPropertyKeys.PARTICIPANT.ADDRESS.BASE][0][
        xmlPropertyKeys.PARTICIPANT.ADDRESS.STREET
      ][0]

    importerStreet = fixString(importerStreet.toString())
    assert.equal(importerStreet, PERMIT_INFO.importAddress[1])
  })

  it('importer city should match', function() {
    let importerCity =
      permit[xmlPropertyKeys.CONSIGNMENT.BASE][0][
        xmlPropertyKeys.CONSIGNMENT.CONSIGNEE
      ][0][xmlPropertyKeys.PARTICIPANT.ADDRESS.BASE][0][
        xmlPropertyKeys.PARTICIPANT.ADDRESS.CITY
      ][0]

    importerCity = fixString(importerCity.toString())
    assert.equal(importerCity, PERMIT_INFO.importAddress[2])
  })

  it('exporter name should match', function() {
    let exporterName =
      permit[xmlPropertyKeys.CONSIGNMENT.BASE][0][
        xmlPropertyKeys.CONSIGNMENT.CONSIGNOR
      ][0][xmlPropertyKeys.PARTICIPANT.NAME][0]

    exporterName = fixString(exporterName.toString())
    assert.equal(exporterName, PERMIT_INFO.exportAddress[0])
  })

  it('exporter street should match', function() {
    let exporterStreet =
      permit[xmlPropertyKeys.CONSIGNMENT.BASE][0][
        xmlPropertyKeys.CONSIGNMENT.CONSIGNOR
      ][0][xmlPropertyKeys.PARTICIPANT.ADDRESS.BASE][0][
        xmlPropertyKeys.PARTICIPANT.ADDRESS.STREET
      ][0]

    exporterStreet = fixString(exporterStreet.toString())
    assert.equal(exporterStreet, PERMIT_INFO.exportAddress[1])
  })

  it('exporter city should match', function() {
    let exporterCity =
      permit[xmlPropertyKeys.CONSIGNMENT.BASE][0][
        xmlPropertyKeys.CONSIGNMENT.CONSIGNOR
      ][0][xmlPropertyKeys.PARTICIPANT.ADDRESS.BASE][0][
        xmlPropertyKeys.PARTICIPANT.ADDRESS.CITY
      ][0]

    exporterCity = fixString(exporterCity.toString())
    assert.equal(exporterCity, PERMIT_INFO.exportAddress[2])
  })
})

//https://github.com/mochajs/mocha/issues/1483 thanks rob3c!
before(function() {
  return new Promise(resolve => {
    permitHash = fs
      .readFileSync('./test/hashes/Permithash.hash')
      .toString('utf-8')
    requestPath =
      'https://localhost:' +
      props('development').port_https +
      '/api/permit/' +
      permitHash
    request(
      {
        url: requestPath,
        method: 'GET',
        agent: agent
      },
      function(error, response, body) {
        if (error) {
          console.log('Was not able to get the permit!')
          throw error
        } else {
          parseString(body, (error, result) => {
            if (error) {
              console.log('Was not able to parse the responsed body!')
              throw error
            } else {
              permit = result[xmlPropertyKeys.PERMIT.BASE]
              let consignment = permit[xmlPropertyKeys.CONSIGNMENT.BASE][0]
              let specimens =
                consignment[xmlPropertyKeys.CONSIGNMENT.SPECIMENS][0][
                  xmlPropertyKeys.SPECIMEN.BASE
                ]
              resolve(specimens)
            }
          })
        }
      }
    )
  }).then(function(specimens) {
    describe('Optimal - Specimens', function() {
      let counterObject = new CounterObject(4, 0)
      let count = 0
      specimens.forEach(function(specimen) {
        it('Specimen ' + count + ' quantity matching', function() {
          let quantity =
            specimen[xmlPropertyKeys.SPECIMEN.TRANSPORT.BASE][0][
              xmlPropertyKeys.SPECIMEN.TRANSPORT.QUANTITY
            ]
          let gotCount = counterObject.getCount()
          assert.equal(quantity, PERMIT_INFO.quantity[gotCount])
        })
        it('Specimen ' + count + ' scientific name matching', function() {
          let sciname =
            specimen[xmlPropertyKeys.SPECIMEN.ITEM.BASE][0][
              xmlPropertyKeys.SPECIMEN.ITEM.PRODUCT.BASE
            ][0][xmlPropertyKeys.SPECIMEN.ITEM.PRODUCT.SCIENTIFIC_NAME][0]
          let gotCount = counterObject.getCount()
          assert.equal(
            fixString(sciname.toString()),
            PERMIT_INFO.scientificName[gotCount]
          )
        })
        it('Specimen ' + count + ' common name matching', function() {
          let comname =
            specimen[xmlPropertyKeys.SPECIMEN.ITEM.BASE][0][
              xmlPropertyKeys.SPECIMEN.ITEM.PRODUCT.BASE
            ][0][xmlPropertyKeys.SPECIMEN.ITEM.PRODUCT.COMMON_NAME][0]
          let gotCount = counterObject.getCount()
          assert.equal(
            fixString(comname.toString()),
            PERMIT_INFO.commonName[gotCount]
          )
        })
        it('Specimen ' + count + ' description matching', function() {
          let desc =
            specimen[xmlPropertyKeys.SPECIMEN.ITEM.BASE][0][
              xmlPropertyKeys.SPECIMEN.ITEM.PRODUCT.BASE
            ][0][xmlPropertyKeys.SPECIMEN.ITEM.PRODUCT.DESCRIPTION][0]

          let gotCount = counterObject.getCount()
          assert.equal(
            fixString(desc.toString()),
            PERMIT_INFO.description[gotCount]
          )
        })
        count++
      })
    })
  })
})

//this is needed so that the above code works
it('', function() {})

describe('Wrong identifier', function() {
  let statusCode = ''
  let message = ''

  let permitHash = ''
  let requestPath = ''

  before(function() {
    return new Promise(resolve => {
      permitHash = 'laiewurbglaeiuh'
      requestPath =
        'https://localhost:8081/api/' + BC_OBJECTS.PERMIT + '/' + permitHash
      request(
        {
          url: requestPath,
          method: 'GET',
          agent: agent
        },
        function(error, response, body) {
          statusCode = response.statusCode
          message = body
          resolve()
        }
      )
    })
  })

  it('status code should be correct', function() {
    assert.equal(statusCode, '404')
  })

  it('message should be correct', function() {
    assert.equal(
      message,
      'The given identifier (laiewurbglaeiuh) does not exist for a permit!'
    )
  })
})

describe('Unsupported conversion type', function() {
  let statusCode = ''
  let message = ''

  let permitHash = ''
  let requestPath = ''

  before(function() {
    return new Promise(resolve => {
      permitHash = fs
        .readFileSync('./test/hashes/Permithash.hash')
        .toString('utf-8')
      requestPath =
        'https://localhost:' +
        props('development').port_https +
        '/api/' +
        BC_OBJECTS.PERMIT +
        '/' +
        permitHash +
        '?conversion=yodelingmonkey'
      request(
        {
          url: requestPath,
          method: 'GET',
          agent: agent
        },
        function(error, response, body) {
          if (error) {
            console.log(error)
          } else {
            statusCode = response.statusCode
            message = body
            resolve()
          }
        }
      )
    })
  })

  it('status code should be correct', function() {
    assert.equal(statusCode, '400')
  })

  it('message should be correct', function() {
    assert.equal(
      message,
      'The defined conversion type (yodelingmonkey) is not supported!'
    )
  })
})
