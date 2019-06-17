pragma solidity >=0.5.0;
// require damits weiterrennt. Die assertion muss true sein, damits weiterrennt. Z.B. require(1 == 1, "1 == 1");
contract GameOfThrones {
  string[] public alliances;
  string[] public families;

  mapping(uint => uint) public familyToAlliance;

  constructor () public {
    uint khaleesi = alliances.push("Khaleesi") - 1;
    uint cercei = alliances.push("Cercei") - 1;

    uint targaryen = families.push("Targaryen") - 1;
    uint lannister = families.push("Lannister") - 1;
    uint stark = families.push("Stark") - 1;

    familyToAlliance[targaryen] = khaleesi;
    familyToAlliance[lannister] = cercei;
    familyToAlliance[stark] = khaleesi;
  }

  function getAlliancesLength() public view returns (uint) {
    return alliances.length;
  }

  function getFamiliesLength() public view returns (uint) {
    return families.length;
  }

  function addAlliance(string memory allianceName) public {
    require(getAllianceId(allianceName) == -1, "Alliance to add already exists");

    alliances.push(allianceName);
  }

  function addFamilyToAlliance(string memory allianceName, string memory familyName) public {
    int256 allianceId = getAllianceId(allianceName);
    require(allianceId != -1, "Alliance doesn't exist yet");
    require(getFamilyId(familyName) == -1, "Family to add already exists");

    uint familyId = families.push(familyName) - 1;
    familyToAlliance[familyId] = uint(allianceId);
    require(familyToAlliance[familyId] == uint(allianceId), "family wasn't added to alliance");
  }

  function transferFamily(string memory allianceNameFrom, string memory allianceNameTo, string memory familyName) public {
    require(!isSameString(allianceNameFrom, allianceNameTo), "alliances can't be the same");
    int256 allianceIdFrom = getAllianceId(allianceNameFrom);
    int256 allianceIdTo = getAllianceId(allianceNameTo);
    int256 familyId = getFamilyId(familyName);
    require(allianceIdFrom != -1, "First alliance doesn't exist yet");
    require(allianceIdTo != -1, "Second alliance doesn't exist yet");
    require(familyId != -1, "Family to transfer doesn't exist yet");
    require(familyToAlliance[uint(familyId)] == uint(allianceIdFrom), "family isn't in alliance");

    familyToAlliance[uint(familyId)] = uint(allianceIdTo);
  }

  function getAllFamilyIdsOfAlliance(string memory allianceName) public view returns (uint[] memory) {
    int256 allianceId = getAllianceId(allianceName);
    require(allianceId != -1, "Alliance doesn't exist yet");

    uint[] memory familyIds = new uint[](getFamilyCountOfAlliance(uint(allianceId)));
    uint counter = 0;
    for(uint i = 0; i < families.length; i++) {
      if(familyToAlliance[i] == uint(allianceId)) {
        familyIds[counter] = i;
        counter++;
      }
    }
    return familyIds;
  }

  function getFamilyCountOfAlliance(uint allianceId) private view returns (uint) {
    uint counter = 0;
    for(uint i = 0; i < families.length; i++) {
      if(familyToAlliance[i] == allianceId) {
        counter++;
      }
    }
    return counter;
  }

  function getAllianceId(string memory allianceName) public view returns (int256) {
    return getId(alliances, allianceName);
  }

  function getFamilyId(string memory familyName) public view returns (int256) {
    return getId(families, familyName);
  }

  function getId(string[] memory array, string memory name) private pure returns (int256) {
    for (uint i = 0; i < array.length; i++) {
      if (isSameString(name, array[i])) {
        return int256(i);
      }
    }

    return -1;
  }

  function isSameString(string memory string1, string memory string2) private pure returns (bool) {
    return keccak256(abi.encodePacked(string1)) == keccak256(abi.encodePacked(string2));
  }
}