const GoT = require("./game-of-thrones.js")
const ZbsAPI = require('@0bsnetwork/zbs-api');
const Zbs = ZbsAPI.create(ZbsAPI.TESTNET_CONFIG);

async function main() {
  var mostRecentBlock = await Zbs.API.Node.blocks.last()
  console.log(mostRecentBlock.reference)
  await GoT.createAlliance("Maria")
  await GoT.addFamilyToAlliance("Khaleesi", "Carolina")
  await GoT.createAlliance("Cercei")
  await GoT.transferFamily("Khaleesi", "Cercei", "Stark")
  await GoT.transferFamily("Cercei", "Khaleesi", "Stark")
}

main()