const bip39 = require('bip39')
const BigchainDB = require('bigchaindb-driver')
const Orm = require('bigchaindb-orm')

const API_PATH = 'https://test.bigchaindb.com/api/v1/'
const conn = new BigchainDB.Connection(API_PATH)

class DID extends Orm {
  constructor(entity) {
      super(API_PATH)
      this.entity = entity
  }
}

async function main() {
  const seedBuffer = await bip39.mnemonicToSeed('seedPhrase')
  const seed = seedBuffer.slice(0,32)
  const alice = new BigchainDB.Ed25519Keypair(seed)
  const car = new BigchainDB.Ed25519Keypair()
  const sensorGPS = new BigchainDB.Ed25519Keypair()
  
  const userDID = new DID(alice.publicKey)
  const carDID = new DID(car.publicKey)
  const gpsDID = new DID(sensorGPS.publicKey)
  
  userDID.define("myModel", "https://schema.org/v1/myModel")
  carDID.define("myModel", "https://schema.org/v1/myModel")
  gpsDID.define("myModel", "https://schema.org/v1/myModel")

  console.log("TERMINATOR TERMINATED SUCCESSFULLY")
}

main()