// This test file uses the tape testing framework.
// To learn more, go here: https://github.com/substack/tape

const { Config, Scenario } = require('@holochain/holochain-nodejs')
Scenario.setTape(require('tape'))
const dnaPath = "./dist/game-of-thrones.dna.json"
const dna = Config.dna(dnaPath, 'happs')
const agentAlice = Config.agent('alice')
const instanceAlice = Config.instance(agentAlice, dna)
const scenario = new Scenario([instanceAlice])

scenario.runTape('Can create an alliance', async (t, { alice }) => {
  const createResult = await alice.callSync('alliances', 'create_alliance', { alliance: { name: 'Cercei' } })
  console.log(createResult)
  t.notEqual(createResult.Ok, undefined)
})

scenario.runTape('Can add some families', async (t, { alice }) => {
  const result1 = await alice.callSync('alliances', 'add_family', { family: { text: 'Stark', completed: true }})
  const result2 = await alice.callSync('alliances', 'add_family', { family: { text: 'Tully', completed: false }})

  console.log(result1)
  console.log(result2)

  t.notEqual(result1.Ok, undefined)
  t.notEqual(result2.Ok, undefined)
})

scenario.runTape('Can link some families to alliances', async (t, { alice }) => {
  const createResult = await alice.callSync('alliances', 'create_alliance', { alliance: { name: 'Khaleesi' } })
  const allianceAddr = createResult.Ok

  const addResult1 = await alice.callSync('alliances', 'add_family', { family: { text: 'Stark', completed: true }})
  family1Addr = addResult1.Ok
  const addResult2 = await alice.callSync('alliances', 'add_family', { family: { text: 'Tully', completed: false }})
  family2Addr = addResult2.Ok

  console.log("addResult1: ", addResult1)
  console.log("addResult2: ", addResult2)
  console.log("family1Addr: ", family1Addr)
  console.log("family2Addr: ", family2Addr)

  const linkResult1 = await alice.callSync('alliances', 'link_family', { family_addr: family1Addr, alliance_addr: allianceAddr })
  const linkResult2 = await alice.callSync('alliances', 'link_family', { family_addr: family2Addr, alliance_addr: allianceAddr })

  console.log("linkResult1: ", linkResult1)
  console.log("linkResult2: ", linkResult2)

  t.notEqual(addResult1.Ok, undefined)
  t.notEqual(addResult2.Ok, undefined)
  t.notEqual(linkResult1.Ok, undefined)
  t.notEqual(linkResult2.Ok, undefined)
})

scenario.runTape('Can get an alliance with families', async (t, { alice }) => {
  const createResult = await alice.callSync('alliances', 'create_alliance', { alliance: { name: 'Khaleesi' } })
  const allianceAddr = createResult.Ok

  const addResult1 = await alice.callSync('alliances', 'add_family', { family: { text: 'Stark', completed: true }})
  family1Addr = addResult1.Ok
  const addResult2 = await alice.callSync('alliances', 'add_family', { family: { text: 'Tully', completed: false }})
  family2Addr = addResult2.Ok

  await alice.callSync('alliances', 'link_family', { family_addr: family1Addr, alliance_addr: allianceAddr })
  await alice.callSync('alliances', 'link_family', { family_addr: family2Addr, alliance_addr: allianceAddr })

  const getResult = await alice.callSync('alliances', 'get_alliance', { alliance_addr: allianceAddr })
  console.log(getResult)

  t.equal(getResult.Ok.families.length, 2, 'there should be 2 families in the alliance')
})

scenario.runTape('Can transfer a family from one alliance to another', async (t, { alice }) => {
  const createResult1 = await alice.callSync('alliances', 'create_alliance', { alliance: { name: 'Khaleesi' } })
  const allianceAddr1 = createResult1.Ok
  const createResult2 = await alice.callSync('alliances', 'create_alliance', { alliance: { name: 'Cercei' } })
  const allianceAddr2 = createResult2.Ok

  const addResult1 = await alice.callSync('alliances', 'add_family', { family: { text: 'Greyjoy', completed: true }})
  family1Addr = addResult1.Ok

  await alice.callSync('alliances', 'link_family', { family_addr: family1Addr, alliance_addr: allianceAddr1 })
  const getResult1 = await alice.callSync('alliances', 'get_alliance', { alliance_addr: allianceAddr1 })
  const getResult2 = await alice.callSync('alliances', 'get_alliance', { alliance_addr: allianceAddr2 })
  t.equal(getResult1.Ok.families.length, 1, 'there should be 1 family in the Khaleesi alliance')
  t.equal(getResult2.Ok.families.length, 0, 'there should be 0 families in the Cercei alliance')

  await alice.callSync('alliances', 'change_alliance', { family_addr: family1Addr, oldAlliance_addr: allianceAddr1, newAlliance_addr: allianceAddr2 })
  const getResult3 = await alice.callSync('alliances', 'get_alliance', { alliance_addr: allianceAddr1 })
  const getResult4 = await alice.callSync('alliances', 'get_alliance', { alliance_addr: allianceAddr2 })
  t.equal(getResult3.Ok.families.length, 0, 'there should be 0 families in the Khaleesi alliance')
  t.equal(getResult4.Ok.families.length, 1, 'there should be 1 family in the Cercei alliance')
})