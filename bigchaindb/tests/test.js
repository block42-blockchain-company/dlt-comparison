const got = require('../game-of-thrones.js')
const BigchainDB = require('bigchaindb-driver')

var assert = require('assert')
var expect = require('chai').expect
var should = require('chai').should()

//how to query bigchaindb: https://docs.bigchaindb.com/projects/js-driver/en/latest/usage.html

describe('Can create new alliance and write to bigchain', function() {
	// And then we describe our testcases.
	it('create alliance', async (done) => {
    
    const khaleesi = new BigchainDB.Ed25519Keypair(Buffer.from("hahahahabubububuhahahahabubububu"))
    //assert.notEqual(khaleesi, undefined)
    //expect(khaleesi).to.equal('promise resolved'); 
    const khaleesiAllianceTxID = await got.createAlliance(got.alliances[0], khaleesi)
    //assert.notEqual(khaleesiAllianceTxID, undefined)
    const alliance = got.getAssetByAssetName("Khaleesi")
    //assert.notEqual(alliance, undefined)

		done()
	});
});