const GoT = require("./game-of-thrones.js")
const BigchainDB = require('bigchaindb-driver')

async function main() {
  const khaleesi = new BigchainDB.Ed25519Keypair(Buffer.from("hahahahabubububuhahahahabubububu"))
  const cercei = new BigchainDB.Ed25519Keypair(Buffer.from("txtxtxtxlolololotxtxtxtxlolololo"))
  console.log("khaleesi: ", khaleesi)
  console.log("cercei: ", cercei)

  const khaleesiAllianceTxID = await GoT.createAlliance(GoT.alliances[0], khaleesi)
  const cerceiAllianceTxID = await GoT.createAlliance(GoT.alliances[1], cercei)

  var familyKeys = []
  var txIDs = []
  for (i = 0; i < GoT.familyNames.length; i++) {
    const key = new BigchainDB.Ed25519Keypair()
    familyKeys.push(key)
    const ID = await GoT.createFamily(GoT.familyNames[i], key)
    txIDs.push(ID)
  }

  familiesKhaleesi = []
  familiesCercei = []

  for (i = 0; i < GoT.familyNames.length; i++) {
    var newOwner
    if (i % 2 == 0) {
      newOwner = khaleesi
      familiesKhaleesi.push(GoT.familyNames[i])
    } else {
      newOwner = cercei
      familiesCercei.push(GoT.familyNames[i])
    }
    await GoT.transferOwnership(txIDs[i], familyKeys[i], newOwner)
  }

  await GoT.updateMetadata(khaleesiAllianceTxID, khaleesi, familiesKhaleesi)
  await GoT.updateMetadata(cerceiAllianceTxID, cercei, familiesCercei)
}

main()