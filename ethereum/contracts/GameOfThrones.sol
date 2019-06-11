pragma solidity >=0.5.0;
// require damits weiterrennt. Die assertion muss true sein, damits weiterrennt. Z.B. require(1 == 1, "1 == 1");
contract GameOfThrones {
  string[] public alliances;
  string[] public families;

  mapping(uint256 => uint256) public familyToAlliance;

  constructor () public {
    uint256 khaleesi = alliances.push("Khaleesi");
    uint256 cercei = alliances.push("Cercei");

    uint256 targaryen = families.push("Targaryen");
    uint256 lannister = families.push("Lannister");
    uint256 stark = families.push("stark");

    familyToAlliance[targaryen] = khaleesi;
    familyToAlliance[lannister] = cercei;
    familyToAlliance[stark] = khaleesi;
  }

  function getAlliancesLength() public view returns (uint256) {
    return alliances.length;
  }

  function getFamiliesLength() public view returns (uint256) {
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

    uint256 familyId = families.push(familyName);
    familyToAlliance[familyId] = uint256(allianceId);
  }

  function transferFamily(string memory allianceNameFrom, string memory allianceNameTo, string memory familyName) public {
    int256 allianceIdFrom = getAllianceId(allianceNameFrom);
    int256 allianceIdTo = getAllianceId(allianceNameTo);
    int256 familyId = getAllianceId(familyName);
    require(allianceIdFrom != -1, "First alliance doesn't exist yet");
    require(allianceIdTo != -1, "Second alliance doesn't exist yet");
    require(familyId != -1, "Family to transfer doesn't exist yet");

    familyToAlliance[uint256(familyId)] = uint256(allianceIdTo);
  }

  function getAllFamilyIdsOfAlliance(string memory allianceName) public view returns (uint256[] memory) {
    int256 allianceId = getAllianceId(allianceName);
    require(allianceId != -1, "First alliance doesn't exist yet");

    uint256[] memory familyIds = new uint256[](getFamilyCountOfAlliance(uint256(allianceId)));
    uint counter = 0;
    for(uint256 i = 0; i < families.length; i++) {
      if(familyToAlliance[i] == uint256(allianceId)) {
        familyIds[counter] = i;
        counter++;
      }
    }
  }

  function getFamilyCountOfAlliance(uint256 allianceId) private view returns (uint256) {
    uint256 counter = 0;
    for(uint256 i = 0; i < families.length; i++) {
      if(familyToAlliance[i] == uint256(allianceId)) {
        counter++;
      }
    }
    return counter;
  }

  function getAllianceId(string memory allianceName) public view returns (int256) {
    return getId(alliances, allianceName);
  }

  function getFamilyId(string memory familyName) private view returns (int256) {
    return getId(families, familyName);
  }

  function getId(string[] memory array, string memory name) private pure returns (int256) {
    for (uint256 i = 0; i < array.length; i++) {
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