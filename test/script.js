//TODO pass this as arguments
const Web3 = require('web3');
const PERMIT_INFO = require('./constants/permit.js')
const { spawn } = require('child_process');
const { exec } = require('child_process');
let DAPP_PATH = '../../cites-on-blocks_dapp/';
var fs = require('fs');

var web3 = undefined;
var permitFactoryContract = undefined;

var contractAddress = ''
var abi = {};
var fullOut = '';
var addresses = [];
var permitHash = undefined;

if (process.argv[2]!==undefined) {
  if(fs.lstatSync(process.argv[2]).isDirectory()){
    DAPP_PATH = process.argv[2];
  }
}

const ganache = spawn ('ganache-cli',['-b 3']);
console.log('started ganache...')

//not quite sure why this works. I don't make sure that this is called after 
//ganache has successfully loaded -> do this when done
const truffle = exec ('truffle migrate', {cwd: DAPP_PATH},(error, stdout, stderr) => {
	console.log('fetching contract address...')
	contractAddress = stdout.match(/PermitFactory: .{42}/)[0];
	contractAddress = contractAddress.substring(15);
  fs.createWriteStream('../data/PermitFactory.address').write(contractAddress);
	console.log('contract address fetched')
	var pipeStream = fs.createReadStream(DAPP_PATH+'build/contracts/PermitFactory.json')
	  .pipe(fs.createWriteStream('../data/PermitFactory.json'));
	pipeStream.on('finish', () => {
		console.log('getting contracts\'s abi...')
		getAbi();
		startWeb3();
	})
});

function getAbi() {
    const content = fs.readFileSync('../data/PermitFactory.json', 'utf-8')
    abi = JSON.parse(content).abi
}

function startWeb3() {
	console.log('starting web3...')
	web3= new Web3(
      new Web3.providers.HttpProvider('http://localhost:8545')
    )
    console.log('initializing contract...');
    web3.eth.defaultAccount = addresses[0];
    web3.personal.unlockAccount(web3.eth.defaultAccount);
    permitFactoryContract = web3.eth.contract(abi).at(contractAddress);
    console.log('setup done!')
    getPermitHash();
    whitelistAddressAndCreatePermit()
}

async function getPermitHash() {
  permitFactoryContract.PermitCreated().watch((error, result) => {
  if (error)
    console.log(error);
  else
    if(permitHash === undefined){
      permitHash = result.args.permitHash;
      console.log(permitHash);
      fs.createWriteStream('./hashes/Permithash.hash').write(permitHash);
      runTests();
    }
  });
}

function runTests() {
  const exporter = spawn ('npm', ['run','dev']);
  exporter.stdout.on('data', function (data) {
    console.log(data.toString());
  });
  exporter.on('exit', function (code) {
    console.log('stopped exporter');
  });
  exporter.stderr.on('data', function(err) {
    console.log(err.toString());
  })
  //run this only once the server has started
  const test = exec ('npm test', {cwd: '.'},(error, stdout, stderr) => {
    console.log(stdout);
    if(error){
      console.log(error);
    }
    //somehow kill doesn't work for the exporter
    const killExporter = exec ('kill ' + exporter.pid)
    ganache.kill('SIGINT')
  });
  
}

function whitelistAddressAndCreatePermit() {
	console.log('Whitelisting address...');
    try {
      permitFactoryContract.addAddresses(
        [addresses[1]],
        web3.fromAscii('DE'),
        { from: addresses[0] }
      )
    } catch (err) {
    	console.log('something went wrong when whitelisting...');
    	console.log(err);
    }
    console.log('Creating permit...');
    try {
      permitFactoryContract.createPermit(
        web3.fromAscii(PERMIT_INFO.exportCountry),
        web3.fromAscii(PERMIT_INFO.importCountry),
        PERMIT_INFO.permitType,
        PERMIT_INFO.exportAddress.map(a => web3.fromAscii(a)),
        PERMIT_INFO.importAddress.map(a => web3.fromAscii(a)),
        PERMIT_INFO.quantity,
        PERMIT_INFO.scientificName.map(a => web3.fromAscii(a)),
        PERMIT_INFO.commonName.map(a => web3.fromAscii(a)),
        PERMIT_INFO.description.map(a => web3.fromAscii(a)),
        PERMIT_INFO.originHash,
        PERMIT_INFO.reexportHash,
        { from: addresses[1], gas: 1000000 }
      )
    } catch (err) {
    	console.log('something went wrong when creating a permit...');
    	console.log(err);
    }
}

ganache.stdout.on('data', function (data) {
  fullOut += data.toString();
  if(fullOut.includes('Private Keys')){
  	console.log('fetching eth addresses...')
  	addresses = fullOut.match(/\(.\) .{42}\n/g);
  	addresses = addresses.map(a => {
  		return a.substring(4,46);
  	});
  	fullOut = '';
  }
});

ganache.stderr.on('data', function (data) {
  console.log('stderr: ' + data.toString());
});

ganache.on('exit', function (code) {
  console.log('stopped gnache');
});
