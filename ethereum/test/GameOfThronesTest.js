const GameOfThrones = artifacts.require("GameOfThrones");
const chai = require('chai')
chai.use(require('chai-as-promised')).should();

var expect = chai.expect;
var BN = require('bn.js');
var bnChai = require('bn-chai');
chai.use(bnChai(BN));

contract("GameOfThrones Tests", async accounts => {
  it("create alliance", async () => {
    let newAlliance = "RobStark";
    let contract = await GameOfThrones.deployed();
    let alliancesLength = await contract.getAlliancesLength();
    let khalessiId = await contract.getAllianceId("Khaleesi");
    let cerceiId = await contract.getAllianceId("Cercei")

    await contract.addAlliance(newAlliance);

    let alliancesNewLength = await contract.getAlliancesLength();
    expect(Number(alliancesNewLength.toString())).to.equal(Number(alliancesLength.toString()) + 1);

    var newAllianceRobStark = await contract.alliances(alliancesNewLength - 1);
    expect(newAllianceRobStark).to.equal(newAlliance);
  });

  it("cannot add alliance that already exists", async () => {
    //var should = require('chai').should();
    let contract = await GameOfThrones.deployed();
    let alliancesLength = await contract.getAlliancesLength();
    await contract.addAlliance("Khaleesi").should.be.rejected; 
    let alliancesNewLength = await contract.getAlliancesLength();
    expect(alliancesNewLength).to.eq.BN(alliancesLength);
  });
  
  it("add families to alliances", async () => {
    let newFamily = "Greyjoy";
    let alliance = "Cercei";
    let contract = await GameOfThrones.deployed();
    let familiesLengthPromise = contract.getFamiliesLength();

    await contract.addFamilyToAlliance(alliance, newFamily);

    let familiesLength = await familiesLengthPromise;
    let newFamilyGreyjoyPromise = contract.families(familiesLength);
    let familiesNewLengthPromise = contract.getFamiliesLength();
    
    let newFamilyGreyjoy = await newFamilyGreyjoyPromise;
    let allianceIdPromise = contract.familyToAlliance.call(familiesLength);

    let familiesNewLength = await familiesNewLengthPromise;

    expect(familiesNewLength).to.eq.BN(familiesLength.add(new BN('1', 10)));
    expect(newFamilyGreyjoy).to.equal(newFamily);
    
    let allianceId = await allianceIdPromise;
    let greyjoyAlliance = await contract.alliances(allianceId);
    expect(greyjoyAlliance).to.equal(alliance)
  });

  it("cannot add family that already exists", async () => {
    let contract = await GameOfThrones.deployed();
    let alliancesLength = await contract.getAlliancesLength();
    await contract.addFamilyToAlliance("Cercei", "Lannister").should.be.rejected;
    let alliancesNewLength = await contract.getAlliancesLength();
    expect(alliancesNewLength).to.eq.BN(alliancesLength);
  });

  it("cannot add to non existent alliance", async () => {
    let contract = await GameOfThrones.deployed();
    let alliancesLength = await contract.getAlliancesLength();
    await contract.addFamilyToAlliance("AllianceDoesntExist", "NewFamily").should.be.rejected;
    let alliancesNewLength = await contract.getAlliancesLength();
    expect(alliancesNewLength).to.eq.BN(alliancesLength);
  });

  it("transfer family", async () => {
    let family = "Tarth";
    let allianceKhaleesi = "Khaleesi";
    let allianceCercei = "Cercei";

    let contract = await GameOfThrones.deployed();
    await contract.addFamilyToAlliance(allianceKhaleesi, family);
 
    let familiesLength = await contract.getFamiliesLength();

    await contract.transferFamily(allianceKhaleesi, allianceCercei, family)

    let familiesNewLength = await contract.getFamiliesLength();
    expect(familiesNewLength).to.eq.BN(familiesLength);

    let allianceOfFamilyId = await contract.familyToAlliance.call(familiesLength - 1); // Off by one error?
    let tarthAlliance = await contract.alliances(allianceOfFamilyId);
    expect(tarthAlliance).to.equal(allianceCercei);
  });

  it("cannot transfer wrong family", async () => {
    let contract = await GameOfThrones.deployed();
    let familyThatDoesNotExist = "Falco";
    let allianceThatDoesNotExist = "Habsburger";
    let familyThatExists = "Stark";
    let allianceThatExists1 = "Khaleesi";
    let allianceThatExists2 = "Cercei";
    await contract.transferFamily(allianceThatExists1, allianceThatDoesNotExist, familyThatExists).should.be.rejected; 
    await contract.transferFamily(allianceThatDoesNotExist, allianceThatExists1, familyThatExists).should.be.rejected; 
    await contract.transferFamily(allianceThatExists1, allianceThatExists2, familyThatDoesNotExist).should.be.rejected;
    await contract.transferFamily(allianceThatExists1, allianceThatExists1, familyThatDoesNotExist).should.be.rejected;

  });

});