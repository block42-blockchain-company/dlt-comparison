//const bip39 = require('bip39')
const BigchainDB = require('bigchaindb-driver')

const API_PATH = 'https://test.bigchaindb.com/api/v1/'
const conn = new BigchainDB.Connection(API_PATH)

const alliances = [
  {
    name: "Khaleesi",
    leader: "Khaleesi Targaryen",
    special_trait: "dragons"
  },
  {
    name: "Cercei",
    leader: "Cercei Lannister",
    special_trait: "incest"
  }
]

const familyNames = [
  "Stark", 
  "Targaryen", 
  "Lannister", 
  "Greyjoy", 
  "Tyrell", 
  "Martell", 
  "Tully", 
  "Arryn"
]

async function createAlliance(alliance, issuer) {
  // Construct a transaction payload
  const txCreateAlliance = BigchainDB.Transaction.makeCreateTransaction(
      // Asset field
      {
          alliance,
      },
      // Metadata field, contains information about the transaction itself
      // (can be `null` if not needed)
      {
          datetime: new Date().toString(),
          families: []
      },
      // Output. For this case we create a simple Ed25519 condition
      [BigchainDB.Transaction.makeOutput(
          BigchainDB.Transaction.makeEd25519Condition(issuer.publicKey))],
      // Issuers
      issuer.publicKey
  )
  // The owner of the alliance signs the transaction
  const txSigned = BigchainDB.Transaction.signTransaction(txCreateAlliance,
    issuer.privateKey)

  // Send the transaction off to BigchainDB
  await conn.postTransactionCommit(txSigned)
  console.log("Create Alliance Transaction created. txSigned.id: ", txSigned.id)
  console.log("Alliance: ", alliance)
  return txSigned.id
}

async function createFamily(family, issuer) {
  // Construct a transaction payload
  const txCreateFamily = BigchainDB.Transaction.makeCreateTransaction(
      // Asset field
      {
          family,
      },
      // Metadata field, contains information about the transaction itself
      // (can be `null` if not needed)
      {
          datetime: new Date().toString()
      },
      // Output. For this case we create a simple Ed25519 condition
      [BigchainDB.Transaction.makeOutput(
          BigchainDB.Transaction.makeEd25519Condition(issuer.publicKey))],
      // Issuers
      issuer.publicKey
  )
  // The owner of the family signs the transaction
  const txSigned = BigchainDB.Transaction.signTransaction(txCreateFamily,
    issuer.privateKey)

  // Send the transaction off to BigchainDB
  await conn.postTransactionCommit(txSigned)
  console.log("Create Family Transaction created. txSigned.id: ", txSigned.id)
  console.log("Family: ", family)
  return txSigned.id
}

function transferOwnership(txCreatedID, currentOwner, newOwner) {
  // Get transaction payload by ID
  conn.getTransaction(txCreatedID)
      .then((txCreated) => {
          const createTranfer = BigchainDB.Transaction.
          makeTransferTransaction(
              // The output index 0 is the one that is being spent
              [{
                  tx: txCreated,
                  output_index: 0
              }],
              [BigchainDB.Transaction.makeOutput(
                  BigchainDB.Transaction.makeEd25519Condition(
                      newOwner.publicKey))],
              {
                  datetime: new Date().toString(),
              }
          )
          // Sign with the key of the owner of the family (currentOwner)
          const signedTransfer = BigchainDB.Transaction
              .signTransaction(createTranfer, currentOwner.privateKey)
          return conn.postTransactionCommit(signedTransfer)
      })
      .then(res => {
          console.log("Transfer Ownership Transaction created. newOwner: ", newOwner)
          console.log("res.id: ", res.id)
      })
}

function updateMetadata(txCreatedID, owner, newFamilies) {
  // Get transaction payload by ID
  conn.getTransaction(txCreatedID)
      .then((txCreated) => {
          const createTranfer = BigchainDB.Transaction.
          makeTransferTransaction(
              // The output index 0 is the one that is being spent
              [{
                  tx: txCreated,
                  output_index: 0
              }],
              [BigchainDB.Transaction.makeOutput(
                  BigchainDB.Transaction.makeEd25519Condition(
                      owner.publicKey))],
              {
                  datetime: new Date().toString(),
                  families: newFamilies
              }
          )
          // Sign with the key of the owner of the alliance
          const signedTransfer = BigchainDB.Transaction
              .signTransaction(createTranfer, owner.privateKey)
          return conn.postTransactionCommit(signedTransfer)
      })
      .then(res => {
          console.log("Update Metadata Transaction created. owner: ", owner)
          console.log("res.id: ", res.id)
          console.log("new Families: ", newFamilies)
      })
}

async function getAssetByAssetName(assetName) {
  return await conn.searchAssets(assetName)
}

async function getAssetByMetaData(metaData) {
  return await conn.searchMetadata(metaData)
}


async function main() {
  const khaleesi = new BigchainDB.Ed25519Keypair(Buffer.from("hahahahabubububuhahahahabubububu"))
  const cercei = new BigchainDB.Ed25519Keypair(Buffer.from("txtxtxtxlolololotxtxtxtxlolololo"))
  console.log("khaleesi: ", khaleesi)
  console.log("cercei: ", cercei)

  const khaleesiAllianceTxID = await createAlliance(alliances[0], khaleesi)
  const cerceiAllianceTxID = await createAlliance(alliances[1], cercei)

  var familyKeys = []
  var txIDs = []
  for (i = 0; i < familyNames.length; i++) {
    const key = new BigchainDB.Ed25519Keypair()
    familyKeys.push(key)
    const ID = await createFamily(familyNames[i], key)
    txIDs.push(ID)
  }

  familiesKhaleesi = []
  familiesCercei = []

  for (i = 0; i < familyNames.length; i++) {
    var newOwner
    if (i % 2 == 0) {
      newOwner = khaleesi
      familiesKhaleesi.push(familyNames[i])
    } else {
      newOwner = cercei
      familiesCercei.push(familyNames[i])
    }
    await transferOwnership(txIDs[i], familyKeys[i], newOwner)
  }

  await updateMetadata(khaleesiAllianceTxID, khaleesi, familiesKhaleesi)
  await updateMetadata(cerceiAllianceTxID, cercei, familiesCercei)
}

//main()


