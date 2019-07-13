'use strict'

const AdminConnection = require('composer-admin').AdminConnection
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection
const { BusinessNetworkDefinition, CertificateUtil, IdCard } = require('composer-common')
const path = require('path')

const chai = require('chai')
const expect = require('chai').expect
chai.should()
chai.use(require('chai-as-promised'))

const namespace = 'com.got.alliance'

describe('Game of Thrones Tests in Hyperledger Fabric Composer', () => {
  // In-memory card store for testing so cards are not persisted to the file system
  const cardStore = require('composer-common').NetworkCardStoreManager.getCardStore( { type: 'composer-wallet-inmemory' } );
  let adminConnection;
  let businessNetworkConnection;

  before(async () => {
      // Embedded connection used for local testing
      const connectionProfile = {
          name: 'embedded',
          'x-type': 'embedded'
      };
      // Generate certificates for use with the embedded connection
      const credentials = CertificateUtil.generate({ commonName: 'admin' });

      // PeerAdmin identity used with the admin connection to deploy business networks
      const deployerMetadata = {
          version: 1,
          userName: 'PeerAdmin',
          roles: [ 'PeerAdmin', 'ChannelAdmin' ]
      };
      const deployerCard = new IdCard(deployerMetadata, connectionProfile);
      deployerCard.setCredentials(credentials);

      const deployerCardName = 'PeerAdmin';
      adminConnection = new AdminConnection({ cardStore: cardStore });

      await adminConnection.importCard(deployerCardName, deployerCard);
      await adminConnection.connect(deployerCardName);
  });

  beforeEach(async () => {
      businessNetworkConnection = new BusinessNetworkConnection({ cardStore: cardStore });

      const adminUserName = 'admin';
      let adminCardName;
      let businessNetworkDefinition = await BusinessNetworkDefinition.fromDirectory(path.resolve(__dirname, '..'));

      // Install the Composer runtime for the new business network
      await adminConnection.install(businessNetworkDefinition);

      // Start the business network and configure an network admin identity
      const startOptions = {
          networkAdmins: [
              {
                  userName: adminUserName,
                  enrollmentSecret: 'adminpw'
              }
          ]
      };
      const adminCards = await adminConnection.start(businessNetworkDefinition.getName(), businessNetworkDefinition.getVersion(), startOptions);

      // Import the network admin identity for us to use
      adminCardName = `${adminUserName}@${businessNetworkDefinition.getName()}`;
      await adminConnection.importCard(adminCardName, adminCards.get(adminUserName));

      // Connect to the business network using the network admin identity
      await businessNetworkConnection.connect(adminCardName);
  });

  describe('#publish', () => {

    it('create alliance', async () => {

        const factory = businessNetworkConnection.getBusinessNetwork().getFactory();

        const createAlliance = factory.newTransaction(namespace, 'CreateAlliance');
        createAlliance.allianceId = "99"
        createAlliance.name = "Khaleesi"
        createAlliance.families = []

        await businessNetworkConnection.submitTransaction(createAlliance);
        const allianceRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.Alliance');
        const createdAlliance = await allianceRegistry.get(createAlliance.allianceId);
        createdAlliance.name.should.equal(createAlliance.name);
    });

    it('add family', async () => {

        const factory = businessNetworkConnection.getBusinessNetwork().getFactory();

        const createAlliance = factory.newTransaction(namespace, 'CreateAlliance');
        createAlliance.allianceId = "00"
        createAlliance.name = "Khaleesi"
        createAlliance.families = []

        await businessNetworkConnection.submitTransaction(createAlliance);
        const allianceRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.Alliance');
        const createdAlliance = await allianceRegistry.get(createAlliance.allianceId);
        createdAlliance.name.should.equal(createAlliance.name);

        const addFamilyToAlliance = factory.newTransaction(namespace, 'AddFamilyToAlliance');
        addFamilyToAlliance.allianceId = "00"
        addFamilyToAlliance.familyId = "11"
        addFamilyToAlliance.name = "Targaryen"

        await businessNetworkConnection.submitTransaction(addFamilyToAlliance);
        const retrievedAlliance = await allianceRegistry.get(addFamilyToAlliance.allianceId);
        retrievedAlliance.families[0].$identifier.should.equal(addFamilyToAlliance.familyId)
    });

    it('transfer family', async () => {

        const factory = businessNetworkConnection.getBusinessNetwork().getFactory();

        const createAlliance1 = factory.newTransaction(namespace, 'CreateAlliance');
        createAlliance1.allianceId = "77"
        createAlliance1.name = "Khaleesi"
        createAlliance1.families = []

        const createAlliance2 = factory.newTransaction(namespace, 'CreateAlliance')
        createAlliance2.allianceId = "88"
        createAlliance2.name = "Cercei"
        createAlliance2.families = []

        await businessNetworkConnection.submitTransaction(createAlliance1)
        await businessNetworkConnection.submitTransaction(createAlliance2)
        const allianceRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.Alliance')
        const createdAlliance1 = await allianceRegistry.get(createAlliance1.allianceId)
        const createdAlliance2 = await allianceRegistry.get(createAlliance2.allianceId)
        createdAlliance1.name.should.equal(createAlliance1.name)
        createdAlliance2.name.should.equal(createAlliance2.name)


        const addFamilyToAlliance1 = factory.newTransaction(namespace, 'AddFamilyToAlliance')
        addFamilyToAlliance1.allianceId = "77"
        addFamilyToAlliance1.familyId = "22"
        addFamilyToAlliance1.name = "Targaryen"

        const addFamilyToAlliance2 = factory.newTransaction(namespace, 'AddFamilyToAlliance')
        addFamilyToAlliance2.allianceId = "77"
        addFamilyToAlliance2.familyId = "33"
        addFamilyToAlliance2.name = "Greyjoy"

        await businessNetworkConnection.submitTransaction(addFamilyToAlliance1)
        await businessNetworkConnection.submitTransaction(addFamilyToAlliance2)

        var retrievedAlliance1 = await allianceRegistry.get(createAlliance1.allianceId)
        expect(retrievedAlliance1.families[0].$identifier).to.be.oneOf([addFamilyToAlliance1.familyId, addFamilyToAlliance2.familyId])
        expect(retrievedAlliance1.families[1].$identifier).to.be.oneOf([addFamilyToAlliance1.familyId, addFamilyToAlliance2.familyId])
        var retrievedAlliance2 = await allianceRegistry.get(createAlliance2.allianceId)
        retrievedAlliance2.families.length.should.equal(0)


        const transferFamily = factory.newTransaction(namespace, 'TransferFamily')
        transferFamily.currentAllianceId = "77"
        transferFamily.newAllianceId = "88"
        transferFamily.familyId = "33"
        await businessNetworkConnection.submitTransaction(transferFamily)

        retrievedAlliance1 = await allianceRegistry.get(createAlliance1.allianceId)
        retrievedAlliance1.families.length.should.equal(1)
        retrievedAlliance1.families[0].$identifier.should.equal(addFamilyToAlliance1.familyId)

        retrievedAlliance2 = await allianceRegistry.get(createAlliance2.allianceId)
        retrievedAlliance2.families.length.should.equal(1)
        retrievedAlliance2.families[0].$identifier.should.equal(addFamilyToAlliance2.familyId)
    });
});
})