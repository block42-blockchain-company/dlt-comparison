const GoT = require('../game-of-thrones.js')
const BigchainDB = require('bigchaindb-driver')

var assert = require('assert')
var expect = require('chai').expect
var should = require('chai').should()

//how to query bigchaindb: https://docs.bigchaindb.com/projects/js-driver/en/latest/usage.html

describe('Can create new alliance and write to bigchain', function() {
  this.timeout(25000)
  let khaleesi
  let cercei

  before('define Khaleesi and Cercei', () => {
    khaleesi = new BigchainDB.Ed25519Keypair(Buffer.from("hahahahabubububuhahahahabubububp"))
    cercei = new BigchainDB.Ed25519Keypair(Buffer.from("txtxtxtxlolololotxtxtxtxlolololp"))
    assert.notEqual(khaleesi, undefined)
    expect(khaleesi).to.have.property("privateKey")
    expect(khaleesi).to.have.property("publicKey")
    assert.notEqual(cercei, undefined)
    expect(cercei).to.have.property("privateKey")
    expect(cercei).to.have.property("publicKey")
  })

	it('create alliance', async () => {
    const khaleesiAllianceTxID = await GoT.createAlliance(GoT.alliances[0], khaleesi)
    expect(khaleesiAllianceTxID).to.not.equal(undefined)
    expect(khaleesiAllianceTxID).to.not.equal(0)

    const alliance = await GoT.getAssetByAssetName("Khaleesi")
    expect(alliance).not.to.equal(undefined)
    expect(alliance).not.to.be.empty
  })
  
  it('create families', async () => {
    var familyKeys = []
    var txIDs = []
    for (i = 0; i < GoT.familyNames.length; i++) {
      const key = new BigchainDB.Ed25519Keypair()
      familyKeys.push(key)
      const ID = await GoT.createFamily(GoT.familyNames[i], key)
      txIDs.push(ID)
    }

    for (i = 0; i < familyKeys.length; i++) {
      expect(familyKeys[i]).not.to.equal(undefined)
      expect(txIDs[i]).not.to.equal(undefined)
      const family = await GoT.getAssetByMetaData(txIDs[i])
      expect(family).not.to.be.empty
    }
  })

  it('transfer families', async () => {
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
    transferTxIDs = []
    for (i = 0; i < GoT.familyNames.length; i++) {
      var newOwner
      if (i % 2 == 0) {
        newOwner = khaleesi
        familiesKhaleesi.push(GoT.familyNames[i])
      } else {
        newOwner = cercei
        familiesCercei.push(GoT.familyNames[i])
      }
      transferTxIDs[i] = await GoT.transferOwnership(txIDs[i], familyKeys[i], newOwner)
    }

    const updateMetadataKhaleesiTxn = await GoT.updateMetadata(khaleesiAllianceTxID, khaleesi, familiesKhaleesi)
    const updateMetadataCerceiTxn = await GoT.updateMetadata(cerceiAllianceTxID, cercei, familiesCercei)

    const khaleesiUpdatedAllianceTxID = await GoT.getAssetByMetaData(updateMetadataKhaleesiTxn.id)
    const cerceiUpdatedAllianceTxID = await GoT.getAssetByMetaData(updateMetadataCerceiTxn.id)

    expect(khaleesiUpdatedAllianceTxID[0].metadata.families.length).to.equal(familiesKhaleesi.length)
    expect(cerceiUpdatedAllianceTxID[0].metadata.families.length).to.equal(familiesCercei.length)

    for (i = 0; i < transferTxIDs.length; i++) {
      const family = await GoT.getTransaction(transferTxIDs[i].id)
      expect(family.outputs[0].public_keys[0]).to.be.oneOf([khaleesi.publicKey, cercei.publicKey])
    }
  }) 
});