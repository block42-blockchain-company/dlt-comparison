const GoT = require("./game-of-thrones.js")
const got = require('got');
const ZbsAPI = require('@0bsnetwork/zbs-api');
const Zbs = ZbsAPI.create(ZbsAPI.TESTNET_CONFIG);
const API_URL = "https://api.testnet-0bsnetwork.com/v0/transactions/data"

var assert = require('assert')
var expect = require('chai').expect
var should = require('chai').should()

//how to query bigchaindb: https://docs.bigchaindb.com/projects/js-driver/en/latest/usage.html

function sleep(ms){
  return new Promise(resolve=>{
      setTimeout(resolve,ms)
  })
}

async function waitForNewBlock() {
  const lastBlock = await Zbs.API.Node.blocks.last()
  do {
    var mostRecentBlock = await Zbs.API.Node.blocks.last()
  } while(lastBlock.reference == mostRecentBlock.reference)
}

describe('Can create new alliances, add families and transfer them between the alliances', function() {
  this.timeout(1000000)
  let khaleesi
  let cercei
  let targaryen
  let lannister

  beforeEach('create alliances', () => {
    khaleesi = "Khaleesi" + Math.random()
    cercei = "Cercei" + Math.random()
    targaryen = "Targaryen" + Math.random()
    lannister = "Lannister" + Math.random()
  })

	it('create alliances', async () => {
    var responseKhaleesi = await got(API_URL + '?key=' + khaleesi, { json: true })
    expect(responseKhaleesi.body.data[0]).to.equal(undefined)
    var responseCercei = await got(API_URL + '?key=' + cercei, { json: true })
    expect(responseCercei.body.data[0]).to.equal(undefined)

    expect(await GoT.createAlliance(khaleesi)).to.equal(0)
    expect(await GoT.createAlliance(cercei)).to.equal(0)

    await waitForNewBlock()

    responseKhaleesi = await got(API_URL + '?key=' + khaleesi, { json: true })
    responseCercei = await got(API_URL + '?key=' + cercei, { json: true })

    expect(responseKhaleesi.body.data[0]).to.not.equal(undefined)
    expect(responseCercei.body.data[0]).to.not.equal(undefined)
    expect(responseKhaleesi.body.data[0].data.data[0].key).to.equal(khaleesi)
    expect(responseCercei.body.data[0].data.data[0].key).to.equal(cercei)

    expect(await GoT.createAlliance(khaleesi)).to.be.equal(-1)
    expect(await GoT.createAlliance(cercei)).to.be.equal(-1)
  })

  it('add families to alliances', async () => {
    expect(await GoT.createAlliance(khaleesi)).to.equal(0)
    expect(await GoT.createAlliance(cercei)).to.equal(0)
    await waitForNewBlock()

    var responseTargaryen = await got(API_URL + '?key=' + targaryen, { json: true })
    expect(responseTargaryen.body.data[0]).to.equal(undefined)
    var responseLannister = await got(API_URL + '?key=' + lannister, { json: true })
    expect(responseLannister.body.data[0]).to.equal(undefined)
    
    expect(await GoT.addFamilyToAlliance(khaleesi, targaryen))
    expect(await GoT.addFamilyToAlliance(cercei, lannister))

    await waitForNewBlock()

    responseTargaryen = await got(API_URL + '?key=' + targaryen, { json: true })
    responseLannister = await got(API_URL + '?key=' + lannister, { json: true })

    expect(responseTargaryen.body.data[0].data.data[0].key).to.be.oneOf([targaryen, khaleesi])
    expect(responseLannister.body.data[0].data.data[0].key).to.be.oneOf([lannister, cercei])
    expect(responseTargaryen.body.data[0].data.data[1].key).to.be.oneOf([targaryen, khaleesi])
    expect(responseLannister.body.data[0].data.data[1].key).to.be.oneOf([lannister, cercei])

    expect(await GoT.addFamilyToAlliance(khaleesi, targaryen)).to.equal(-1)
    expect(await GoT.addFamilyToAlliance(cercei, lannister)).to.equal(-1)
    expect(await GoT.addFamilyToAlliance("Satoshi", targaryen)).to.equal(-1)
    expect(await GoT.addFamilyToAlliance("Zuckerberg", lannister)).to.equal(-1)
  })

  it('transfer families', async () => {
    expect(await GoT.createAlliance(khaleesi)).to.equal(0)
    expect(await GoT.createAlliance(cercei)).to.equal(0)
    await waitForNewBlock()

    expect(await GoT.addFamilyToAlliance(khaleesi, targaryen))
    expect(await GoT.addFamilyToAlliance(cercei, lannister))
    await waitForNewBlock()

    var responseTargaryen = await got(API_URL + '?key=' + targaryen, { json: true })
    console.log("responseTargaryen.body.data[0].data.data[0].key: ", responseTargaryen.body.data[0].data.data[0].key)
    console.log("responseTargaryen.body.data[0].data.data[1].key: ", responseTargaryen.body.data[0].data.data[1].key)
    expect(responseTargaryen.body.data[0].data.data[0].key).to.be.oneOf([targaryen, khaleesi])
    expect(responseTargaryen.body.data[0].data.data[1].key).to.be.oneOf([targaryen, khaleesi])
    var responseLannister = await got(API_URL + '?key=' + lannister, { json: true })
    console.log("responseLannister.body.data[0].data.data[0].key: ", responseLannister.body.data[0].data.data[0].key)
    console.log("responseLannister.body.data[0].data.data[1].key: ", responseLannister.body.data[0].data.data[1].key)
    expect(responseLannister.body.data[0].data.data[0].key).to.be.oneOf([lannister, cercei])
    expect(responseLannister.body.data[0].data.data[1].key).to.be.oneOf([lannister, cercei])


    expect(await GoT.transferFamily(cercei, khaleesi, lannister)).to.equal(0)
    await waitForNewBlock()

    var responseCercei = await got(API_URL + '?key=' + cercei, { json: true })
    var responseKhaleesi = await got(API_URL + '?key=' + khaleesi, { json: true })

    console.log("responseCercei.body.data[0].data.data[0].key: ", responseCercei.body.data[0].data.data[0].key)
    console.log("responseKhaleesi.body.data[0].data.data[0].key: ", responseKhaleesi.body.data[0].data.data[0].key)
    console.log("responseKhaleesi.body.data[0].data.data[1].key: ", responseKhaleesi.body.data[0].data.data[1].key)
    console.log("responseKhaleesi.body.data[0].data.data[2].key: ", responseKhaleesi.body.data[0].data.data[2].key)
    
    expect(responseCercei.body.data[0].data.data[0].key).to.equal(cercei)
    expect(responseKhaleesi.body.data[0].data.data[0].key).to.be.oneOf([targaryen, lannister, khaleesi])
    expect(responseKhaleesi.body.data[0].data.data[1].key).to.be.oneOf([targaryen, lannister, khaleesi])
    expect(responseKhaleesi.body.data[0].data.data[2].key).to.be.oneOf([targaryen, lannister, khaleesi])

    expect(await GoT.transferFamily(cercei, khaleesi, targaryen)).to.equal(-1)
    expect(await GoT.transferFamily(khaleesi, cercei, "FamilyThatDoesNotExist")).to.equal(-1)
  })
});