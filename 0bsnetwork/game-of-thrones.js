const ZbsAPI = require('@0bsnetwork/zbs-api');
const got = require('got');
const {phrase} = require('./keyPhrase.js')

const Zbs = ZbsAPI.create(ZbsAPI.TESTNET_CONFIG);

const seed = Zbs.Seed.fromExistingPhrase(phrase);


getData = async function (key) {
  const keyExists = await got('https://api.testnet-0bsnetwork.com/v0/transactions/data?sender=3MtptFMCTZhMGuQhFj5aiCLDKZFHwUTcwHf&key=' + key, { json: true })
  if (keyExists.body.data[0]) {
    return keyExists.body.data[0].data.data
  }
  return undefined
}

exports.createAlliance = async function (alliance) {
  if(await getData(alliance)) {
    console.error("Alliance already exists")
    return
  }

  const createAllianceData = {
    data: [ 
      {
        "key" : alliance,
        "type" : "integer",
        "value" : 0
      },
    ]
  }
  const respone = await Zbs.API.Node.transactions.broadcast('data', createAllianceData, seed.keyPair)
  console.log(respone)
}

exports.addFamilyToAlliance = async function (alliance, family) {
  if(await getData(family)) {
    console.error("Family already exists")
    return
  }

  var allianceData = await getData(alliance)
  if(!allianceData) {
    console.error("Alliance doesn't exist yet")
    return
  }

  allianceData.push({
    "key" : family,
    "type" : "string",
    "value" : alliance
  })
  allianceData[0].value = allianceData[0].value + 1

  const addFamilyData = {
    data: allianceData
  }

  const respone = await Zbs.API.Node.transactions.broadcast('data', addFamilyData, seed.keyPair)
  console.log(respone)
}

exports.transferFamily = async function (fromAlliance, toAlliance, family) {
  var allianceFromData = await getData(fromAlliance)
  if(!allianceFromData) {
    console.error("Alliance doesn't exist yet")
    return
  }

  var allianceToData = await getData(toAlliance)
  if(!allianceToData) {
    console.error("Alliance doesn't exist yet")
    return
  }

  var familyData = await getData(family)
  if (!familyData) {
    console.error("Family doesn't exist yet")
    return
  } else if (allianceFromData.findIndex(x => x.key === family) == -1) {
    console.error("Family isn't in alliance from which it should be removed")
    return
  } else if (allianceToData.findIndex(x => x.key === family) != -1) {
    console.error("Family is already in alliance to which it should be transfered to")
    return
  }

  const indexFamily = allianceFromData.findIndex(x => x.key === family)
  const familyElement = allianceFromData[indexFamily]
  allianceFromData.splice(indexFamily, 1)

  const indexAllianceFrom = allianceFromData.findIndex(x => x.key === fromAlliance)
  allianceFromData[indexAllianceFrom].value = allianceFromData[indexAllianceFrom].value - 1
  var respone = await Zbs.API.Node.transactions.broadcast('data', {data: allianceFromData}, seed.keyPair)
  console.log(respone)

  allianceToData.push(familyElement)
  const indexAllianceTo = allianceToData.findIndex(x => x.key === toAlliance)
  allianceToData[indexAllianceTo].value = allianceToData[indexAllianceTo].value + 1
  respone = await Zbs.API.Node.transactions.broadcast('data', {data: allianceToData}, seed.keyPair)
  console.log(respone)
}