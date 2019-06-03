const ZbsAPI = require('@0bsnetwork/zbs-api');
const {phrase} = require('./keyPhrase.js')

const Zbs = ZbsAPI.create(ZbsAPI.TESTNET_CONFIG);

const seed = Zbs.Seed.fromExistingPhrase(phrase);

Zbs.API.Node.transactions.getList(seed.address).then((txList) => {
  console.log(txList);
})