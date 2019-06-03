const GoT = require("./game-of-thrones.js")
const got = require('got');
const ZbsAPI = require('@0bsnetwork/zbs-api');
const Zbs = ZbsAPI.create(ZbsAPI.TESTNET_CONFIG);

var assert = require('assert')
var expect = require('chai').expect
var should = require('chai').should()

//how to query bigchaindb: https://docs.bigchaindb.com/projects/js-driver/en/latest/usage.html

function sleep(ms){
  return new Promise(resolve=>{
      setTimeout(resolve,ms)
  })
}

describe('Can create new alliances, add families and transfer them between the alliances', function() {
  this.timeout(1000000)
  let khaleesi
  let cercei
  let stark
  let lannister

  before('create alliances', () => {
    khaleesi = "Khaleesi" + Math.random()
    cercei = "Cercei" + Math.random()
  })

	it('create alliances', async () => {
    var responseKhaleesi = await got('https://api.testnet-0bsnetwork.com/v0/transactions/data?key=' + khaleesi, { json: true })
    expect(responseKhaleesi.body.data[0]).to.equal(undefined)
    var responseCercei = await got('https://api.testnet-0bsnetwork.com/v0/transactions/data?key=' + cercei, { json: true })
    expect(responseCercei.body.data[0]).to.equal(undefined)
    var lastBlock = await Zbs.API.Node.blocks.last()
    await GoT.createAlliance(khaleesi)
    await GoT.createAlliance(cercei)
    do {
      var mostRecentBlock = await Zbs.API.Node.blocks.last()
    } while(lastBlock.reference == mostRecentBlock.reference)
    responseKhaleesi = await got('https://api.testnet-0bsnetwork.com/v0/transactions/data?key=' + khaleesi, { json: true })
    responseCercei = await got('https://api.testnet-0bsnetwork.com/v0/transactions/data?key=' + cercei, { json: true })

    expect(responseKhaleesi.body.data[0]).to.not.equal(undefined)
    expect(responseCercei.body.data[0]).to.not.equal(undefined)
  })
});