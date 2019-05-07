//const bip39 = require('bip39')
const BigchainDB = require('bigchaindb-driver')

const API_PATH = 'https://test.bigchaindb.com/api/v1/'
const conn = new BigchainDB.Connection(API_PATH)

exports.alliances = [
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

exports.familyNames = [
  "Stark", 
  "Targaryen", 
  "Lannister", 
  "Greyjoy", 
  "Tyrell", 
  "Martell", 
  "Tully", 
  "Arryn"
]

exports.createAlliance = async function (alliance, issuer) {
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

exports.createFamily = async function (family, issuer) {
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

exports.transferOwnership = async function (txCreatedID, currentOwner, newOwner) {
  // Get transaction payload by ID
  const txCreated = await conn.getTransaction(txCreatedID)
  const createTranfer = BigchainDB.Transaction.makeTransferTransaction(
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
  const signedTransfer = BigchainDB.Transaction.signTransaction(createTranfer, currentOwner.privateKey)
  const txSignedTransfer = await conn.postTransactionCommit(signedTransfer)

  console.log("Transfer Ownership Transaction created. newOwner: ", newOwner)
  console.log("txSignedTransfer: ", txSignedTransfer)
  console.log("txSignedTransfer.id: ", txSignedTransfer.id)
  return txSignedTransfer
}

exports.updateMetadata = async function (txCreatedID, owner, newFamilies) {
  // Get transaction payload by ID
  const txCreated = await conn.getTransaction(txCreatedID)
  const createTranfer = BigchainDB.Transaction.makeTransferTransaction(
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
  const signedTransfer = BigchainDB.Transaction.signTransaction(createTranfer, owner.privateKey)
  const txSignedTransfer = await conn.postTransactionCommit(signedTransfer)

  console.log("Update Metadata Transaction created. owner: ", owner)
  console.log("txSignedTransfer: ", txSignedTransfer)
  console.log("txSignedTransfer.id: ", txSignedTransfer.id)
  console.log("new Families: ", newFamilies)
  return txSignedTransfer
}

exports.getAssetByAssetName = async function (assetName) {
  return await conn.searchAssets(assetName)
}

exports.getAssetByMetaData = async function (metaData) {
  return await conn.searchMetadata(metaData)
}

exports.getTransaction = async function (txnId) {
  return await conn.getTransaction(txnId)
}


