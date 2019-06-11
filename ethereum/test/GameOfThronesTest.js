const GameOfThrones = artifacts.require("GameOfThrones");

contract("GameOfThrones Tests", async accounts => {
  
  it("create alliance", async () => {
    /* var result = new BigNumber('100000000000000000').plus(1);
    var expected = '100000000000000001';
    result.should.be.bignumber.equal(expected);
    expect(result).to.be.bignumber.at.most(expected);
    '1000'.should.be.bignumber.lessThan(2000); */

    let newAlliance = "RobStark";
    let contract = await GameOfThrones.deployed();
    let alliancesLength = await contract.getAlliancesLength();
    let khalessiId = await contract.getAllianceId("Khaleesi");
    let cerceiId = await contract.getAllianceId("Cercei")
    console.log("KhaleesiId: ", khalessiId.toString());
    console.log("CerceiId: ", cerceiId.toNumber());

    //expect(new BN('1')).to.eq.BN(khalessiId);

    await contract.addAlliance(newAlliance);  //, { from: "0x3594B36604A37C680f149E0A96A83bE39f97b0Db" }

    let alliancesNewLength = await contract.getAlliancesLength();
    expect(Number(alliancesNewLength.toString())).to.equal(Number(alliancesLength.toString()) + 1);

    var newAllianceRobStark = await contract.alliances(alliancesNewLength - 1);
    expect(newAllianceRobStark).to.equal(newAlliance);
  });

  /* it("cannot add alliance that already exists", async () => {
    let contract = await GameOfThrones.deployed();
    let alliancesLength = await contract.getAlliancesLength();
    await contract.addAlliance("Khaleesi"); 
    let alliancesNewLength = await contract.getAlliancesLength();
    expect(alliancesNewLength).to.equal(alliancesLength);


    await catchRevert(myContract.func({from: nonOwner}));
  }); */
  
  /* it("add families to alliances", async () => {
    let newFamily = "Greyjoy";
    let alliance = "Cercei";
    let contract = await GameOfThrones.deployed();
    let familiesLength = await contract.getFamiliesLength();
    await contract.addFamilyToAlliance(alliance, newFamily);

    let familiesNewLengthPromise = contract.getFamiliesLength();
    let newFamilyGreyjoyPromise = contract.families(familiesNewLength);
    let allianceIdPromise = familyToAlliance[newFamilyGreyjoy];

    let familiesNewLength = await familiesNewLengthPromise;
    let newFamilyGreyjoy = await newFamilyGreyjoyPromise

    expect(familiesNewLength).to.equal(familiesLength + 1);
    expect(newFamilyGreyjoy).to.equal(newFamily);

    let allianceId = await allianceIdPromise;
    let greyjoyAlliance = await contract.alliances(allianceId);
    expect(greyjoyAlliance).to.equal(alliance)
  }); */

  /* it("cannot add family that already exists", async () => {
    let contract = await GameOfThrones.deployed();
    let alliancesLength = await contract.getAlliancesLength();
    await contract.addFamilyToAlliance("Cercei", "Lannister");
    let alliancesNewLength = await contract.getAlliancesLength();
    expect(alliancesNewLength).to.equal(alliancesLength);
  });

  it("cannot add to non existent alliance", async () => {
    let contract = await GameOfThrones.deployed();
    let alliancesLength = await contract.getAlliancesLength();
    await contract.addFamilyToAlliance("AllianceDoesntExist", "NewFamily");
    let alliancesNewLength = await contract.getAlliancesLength();
    expect(alliancesNewLength).to.equal(alliancesLength);
  }); */
});