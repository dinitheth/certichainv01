// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract InstitutionRegistry is Ownable {
    struct Institution {
        string name;
        bool isActive;
    }

    mapping(address => Institution) public institutions;
    address[] public institutionList;

    event InstitutionRegistered(address indexed institution, string name);
    event InstitutionRemoved(address indexed institution);

    constructor() Ownable(msg.sender) {}

    function registerInstitution(address _institution, string memory _name) external onlyOwner {
        require(!institutions[_institution].isActive, "Institution already registered");
        
        institutions[_institution] = Institution({
            name: _name,
            isActive: true
        });
        
        institutionList.push(_institution);
        emit InstitutionRegistered(_institution, _name);
    }

    function removeInstitution(address _institution) external onlyOwner {
        require(institutions[_institution].isActive, "Institution not registered");
        
        institutions[_institution].isActive = false;
        emit InstitutionRemoved(_institution);
    }

    function isAuthorized(address _institution) external view returns (bool) {
        return institutions[_institution].isActive;
    }

    function getInstitution(address _institution) external view returns (string memory name, bool isActive) {
        Institution memory inst = institutions[_institution];
        return (inst.name, inst.isActive);
    }

    function getAllInstitutions() external view returns (address[] memory) {
        return institutionList;
    }
}