const bip39 = require('bip39')
const BigchainDB = require('bigchaindb-driver')

const API_PATH = 'https://test.bigchaindb.com/api/v1/'
const conn = new BigchainDB.Connection(API_PATH)

const painting = {
  name: 'Meninas',
  author: 'Diego Rodríguez de Silva y Velázquez',
  place: 'Madrid',
  year: '1656'
}

async function createPaint() {
  // Construct a transaction payload
  const txCreatePaint = BigchainDB.Transaction.makeCreateTransaction(
      // Asset field
      {
          painting,
      },
      // Metadata field, contains information about the transaction itself
      // (can be `null` if not needed)
      {
          datetime: new Date().toString(),
          location: 'Madrid',
          value: {
              value_eur: '25000000€',
              value_btc: '2200',
          }
      },
      // Output. For this case we create a simple Ed25519 condition
      [BigchainDB.Transaction.makeOutput(
          BigchainDB.Transaction.makeEd25519Condition(alice.publicKey))],
      // Issuers
      alice.publicKey
  )
  // The owner of the painting signs the transaction
  const txSigned = BigchainDB.Transaction.signTransaction(txCreatePaint,
      alice.privateKey)

  // Send the transaction off to BigchainDB
  await conn.postTransactionCommit(txSigned)
  console.log("Create Transaction created. txSigned.id: ", txSigned.id)
  return txSigned.id
}

function transferOwnership(txCreatedID, newOwner) {
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
                  value: {
                      value_eur: '30000000€',
                      value_btc: '2100',
                  }
              }
          )
          // Sign with the key of the owner of the painting (Alice)
          const signedTransfer = BigchainDB.Transaction
              .signTransaction(createTranfer, alice.privateKey)
          return conn.postTransactionCommit(signedTransfer)
      })
      .then(res => {
          /* document.body.innerHTML += '<h3>Transfer Transaction created</h3>'
          document.body.innerHTML += res.id */
          console.log("Transfer Transaction created. res.id: ", res.id)
      })
}

async function main() {
  const createTxID = await createPaint()
  transferOwnership(createTxID, bob)
  
  console.log("TERMINATOR TERMINATED SUCCESSFULLY")
}

const alice = new BigchainDB.Ed25519Keypair(Buffer.from("hahahahabubububuhahahahabubububu"))
const bob = new BigchainDB.Ed25519Keypair(Buffer.from("txtxtxtxlolololotxtxtxtxlolololo"))
console.log("alice: ", alice)
console.log("bob: ", bob)

main()


