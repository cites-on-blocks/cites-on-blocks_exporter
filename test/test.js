const { exec } = require('child_process');
let assert = require('assert');
const PERMIT_INFO = require('./constants/permit.js');
const fixString = require('./utils/hexStringFixer.js');
let CounterObject = require('./utils/counterObject.js');
const fs = require('fs');
const https = require('https'); //import { parseString } from 'xml2js' doesn't work for some reason
const parseString = require('xml2js').parseString
let convert = require('xml-js');
let request = require('request');

let agentOptions = {
  host: 'localhost',
  port: '8081',
  path: '/',
  rejectUnauthorized: false
};

let agent = new https.Agent(agentOptions);

describe('Optimal - Persons', function() {

  let permit = undefined

  let permitHash = '';
  let requestPath = '';

  before(function() {
    return new Promise((resolve) => {
      permitHash = fs.readFileSync('./test/hashes/Permithash.hash').toString('utf-8');
      requestPath = 'https://localhost:8081/api/permit/' + permitHash;
      request({
        url: requestPath,
        method: 'GET',
        agent: agent
      }, function (error, response, body) {
        //console.log('error:', error); 
        //console.log('statusCode:', response && response.statusCode);
        //let newx = convert.xml2json(body, {compact: true, spaces: 4});
        //console.log(newx)
        if (error) {
          console.log(error)
        }
        parseString(body, (err, result) => {
          permit = result.permit;
          resolve();
        })
      });
    });
  });

    it('permit type should match', function() {
      assert.equal(permit.type[0], PERMIT_INFO.permitType);
    });

    it('export country should match', function() {
      let exportCountry = permit['export-country'][0]
      assert.equal(fixString(exportCountry.toString()), PERMIT_INFO.exportCountry);
    });

    it('import country should match', function() {
      let importCountry = permit['import-country'][0]
      assert.equal(fixString(importCountry.toString()), PERMIT_INFO.importCountry);
    });

    it('importer name should match', function() {
      let importerName = permit.importer[0].name
      importerName = fixString(importerName.toString());
      assert.equal(importerName, PERMIT_INFO.importAddress[0]);
    });

    it('importer street should match', function() {
      let importerStreet = permit.importer[0].street
      importerStreet = fixString(importerStreet.toString());
      assert.equal(importerStreet, PERMIT_INFO.importAddress[1]);
    });

    it('importer city should match', function() {
      let importerCity = permit.importer[0].city
      importerCity = fixString(importerCity.toString());
      assert.equal(importerCity, PERMIT_INFO.importAddress[2]);
    });

    it('exporter name should match', function() {
      let exporterName = permit.exporter[0].name
      exporterName = fixString(exporterName.toString());
      assert.equal(exporterName, PERMIT_INFO.exportAddress[0]);
    });

    it('exporter street should match', function() {
      let exporterStreet = permit.exporter[0].street
      exporterStreet = fixString(exporterStreet.toString());
      assert.equal(exporterStreet, PERMIT_INFO.exportAddress[1]);
    });

    it('exporter city should match', function() {
      let exporterCity = permit.exporter[0].city
      exporterCity = fixString(exporterCity.toString());
      assert.equal(exporterCity, PERMIT_INFO.exportAddress[2]);
    });
});

//https://github.com/mochajs/mocha/issues/1483 thanks rob3c!
before(function () {
    return new Promise((resolve) => {
      permitHash = fs.readFileSync('./test/hashes/Permithash.hash').toString('utf-8');
      requestPath = 'https://localhost:8081/api/permit/' + permitHash;
      request({
        url: requestPath,
        method: 'GET',
        agent: agent
      }, function (error, response, body) {
        //console.log('error:', error); 
        //console.log('statusCode:', response && response.statusCode);
        //let newx = convert.xml2json(body, {compact: true, spaces: 4});
        //console.log(newx)
        if (error) {
          console.log(error)
        }
        console.log(body)
        parseString(body, (err, result) => {
          permit = result.permit;
          console.log(permit.specimens[0].specimen)
          resolve(permit.specimens[0].specimen);
        })
      });
    }).then(function (specimens) {
        describe('Optimal - Specimens', function () {
            let counterObject = new CounterObject(4,0);
            let count = 0;
            console.log(specimens.length)
            specimens.forEach(function (specimen) {
                it('Specimen ' + count + ' quantity matching', function () {
                    let quantity = specimen.quantity
                    let gotCount = counterObject.getCount()
                    assert.equal(quantity, PERMIT_INFO.quantity[gotCount]);
                });
                it('Specimen ' + count + ' scientific name matching', function () {
                    let sciname = specimen['scientific-name'][0]
                    let gotCount = counterObject.getCount()
                    assert.equal(fixString(sciname.toString()), PERMIT_INFO.scientificName[gotCount]);
                });
                it('Specimen ' + count + ' common name matching', function () {
                    let comname = specimen['common-name'][0]
                    let gotCount = counterObject.getCount()
                    assert.equal(fixString(comname.toString()), PERMIT_INFO.commonName[gotCount]);
                });
                it('Specimen ' + count + ' description matching', function () {
                    let desc = specimen.description
                    let gotCount = counterObject.getCount()
                    assert.equal(fixString(desc.toString()), PERMIT_INFO.description[gotCount]);
                });
                count++
            });
        });
  });
});

it('This is a required placeholder to allow before() to work', function () {
    console.log('Mocha should not require this hack IMHO');
});


describe('Wrong identifier', function() {
    let statusCode = ''
    let message = ''

    let permitHash = '';
    let requestPath = '';

    before(function() {
      return new Promise((resolve) => {
        permitHash = 'laiewurbglaeiuh'
        requestPath = 'https://localhost:8081/api/permit/' + permitHash;
        request({
          url: requestPath,
          method: 'GET',
          agent: agent
        }, function (error, response, body) {
          statusCode = response.statusCode
          message = body
          resolve();
      });
      });
    });

    it('status code should be correct', function() {
      assert.equal(statusCode, '404');
    });

    it('message should be correct', function() {
      assert.equal(message, 'The given identifier (laiewurbglaeiuh) does not exist for a permit!');
    });

});