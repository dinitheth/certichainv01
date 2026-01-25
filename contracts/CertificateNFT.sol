// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IInstitutionRegistry {
    function isAuthorized(address _institution) external view returns (bool);
}

contract CertificateNFT is ERC721, Ownable {
    struct Certificate {
        address issuer;
        bytes32 studentNameHash;
        bytes32 studentEmailHash;
        string course;
        uint256 issueDate;
        uint256 enrollmentDate;
        bool isValid;
        string ipfsHash;
        string revokeReason;
    }

    IInstitutionRegistry public institutionRegistry;
    
    uint256 private _tokenIdCounter;
    mapping(uint256 => Certificate) public certificates;
    mapping(bytes32 => uint256) public dataHashToTokenId;

    event CertificateIssued(uint256 indexed tokenId, address indexed issuer, address indexed student, bytes32 dataHash);
    event CertificateRevoked(uint256 indexed tokenId, string reason);

    constructor(address _registryAddress) ERC721("CertiChain Certificate", "CERT") Ownable(msg.sender) {
        institutionRegistry = IInstitutionRegistry(_registryAddress);
    }

    modifier onlyAuthorizedInstitution() {
        require(institutionRegistry.isAuthorized(msg.sender), "Not an authorized institution");
        _;
    }

    function issueCertificate(
        address student,
        bytes32 nameHash,
        bytes32 emailHash,
        string memory course,
        uint256 enrollmentDate,
        string memory ipfsHash,
        bytes32 dataHash
    ) external onlyAuthorizedInstitution returns (uint256) {
        require(dataHashToTokenId[dataHash] == 0, "Certificate with this data already exists");
        
        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;

        certificates[newTokenId] = Certificate({
            issuer: msg.sender,
            studentNameHash: nameHash,
            studentEmailHash: emailHash,
            course: course,
            issueDate: block.timestamp,
            enrollmentDate: enrollmentDate,
            isValid: true,
            ipfsHash: ipfsHash,
            revokeReason: ""
        });

        dataHashToTokenId[dataHash] = newTokenId;
        
        _mint(student, newTokenId);
        emit CertificateIssued(newTokenId, msg.sender, student, dataHash);

        return newTokenId;
    }

    function revokeCertificate(uint256 tokenId, string memory reason) external {
        require(_ownerOf(tokenId) != address(0), "Certificate does not exist");
        require(certificates[tokenId].issuer == msg.sender, "Only issuer can revoke");
        require(certificates[tokenId].isValid, "Certificate already revoked");

        certificates[tokenId].isValid = false;
        certificates[tokenId].revokeReason = reason;

        emit CertificateRevoked(tokenId, reason);
    }

    function getCertificate(uint256 tokenId) external view returns (Certificate memory) {
        require(_ownerOf(tokenId) != address(0), "Certificate does not exist");
        return certificates[tokenId];
    }

    function getCertificateByHash(bytes32 dataHash) external view returns (uint256) {
        return dataHashToTokenId[dataHash];
    }

    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert("Soulbound: Transfer not allowed");
        }
        return super._update(to, tokenId, auth);
    }
}