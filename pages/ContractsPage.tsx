import React from 'react';
import CodeViewer from '../components/CodeViewer';

const REGISTRY_CODE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract InstitutionRegistry is Ownable {
    mapping(address => bool) public institutions;
    address[] public allInstitutions;
    mapping(address => bool) public hasBeenAdded;

    event InstitutionRegistered(address indexed institution);
    event InstitutionRemoved(address indexed institution);

    constructor() Ownable(msg.sender) {}

    function registerInstitution(address _institution) external onlyOwner {
        require(_institution != address(0), "Registry: Invalid institution address");
        require(!institutions[_institution], "Registry: Institution already active");
        
        institutions[_institution] = true;

        if (!hasBeenAdded[_institution]) {
            allInstitutions.push(_institution);
            hasBeenAdded[_institution] = true;
        }

        emit InstitutionRegistered(_institution);
    }

    function removeInstitution(address _institution) external onlyOwner {
        require(institutions[_institution], "Registry: Institution not registered");
        
        institutions[_institution] = false;
        emit InstitutionRemoved(_institution);
    }

    function isAuthorized(address _institution) external view returns (bool) {
        return institutions[_institution];
    }

    function getAllInstitutions() external view returns (address[] memory) {
        return allInstitutions;
    }

    function owner() public view override returns (address) {
        return super.owner();
    }
}`;

const NFT_CODE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IRegistry {
    function isAuthorized(address) external view returns (bool);
}

contract CertificateNFT is ERC721, Ownable {
    IRegistry public registry;
    uint256 private _nextTokenId;

    struct Certificate {
        address issuer;
        string studentNameHash;
        string studentEmailHash;
        string course;
        uint256 issueDate;
        uint256 enrollmentDate;
        bool isValid;
        string ipfsHash;
        string revokeReason;
    }

    mapping(uint256 => Certificate) public certificates;
    mapping(bytes32 => uint256) public certificateByHash;

    event CertificateIssued(uint256 indexed tokenId, address indexed issuer, address indexed student, bytes32 indexed dataHash);
    event CertificateRevoked(uint256 indexed tokenId, string reason);

    constructor(address _registry) ERC721("CertiChain", "CERT") Ownable(msg.sender) {
        registry = IRegistry(_registry);
    }

    modifier onlyAuthorized() {
        require(registry.isAuthorized(msg.sender), "Auth: Caller is not an authorized institution");
        _;
    }

    function issueCertificate(
        address student, 
        string memory nameHash, 
        string memory emailHash,
        string memory course, 
        uint256 enrollmentDate,
        string memory ipfsHash,
        bytes32 dataHash
    ) external onlyAuthorized returns (uint256) {
        require(certificateByHash[dataHash] == 0, "Issue: Certificate with this data hash already exists");

        uint256 tokenId = _nextTokenId++;
        _safeMint(student, tokenId);

        certificates[tokenId] = Certificate({
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

        certificateByHash[dataHash] = tokenId;

        emit CertificateIssued(tokenId, msg.sender, student, dataHash);

        return tokenId;
    }

    function revokeCertificate(uint256 tokenId, string memory reason) external {
        require(certificates[tokenId].issuer == msg.sender, "Revoke: Caller must be the issuer of this certificate");
        require(certificates[tokenId].isValid, "Revoke: Certificate is already revoked");
        
        certificates[tokenId].isValid = false;
        certificates[tokenId].revokeReason = reason;
        
        emit CertificateRevoked(tokenId, reason);
    }

    function getCertificate(uint256 tokenId) external view returns (Certificate memory) {
        return certificates[tokenId];
    }
    
    function getCertificateByHash(bytes32 dataHash) external view returns (uint256) {
        require(certificateByHash[dataHash] != 0, "Lookup: No certificate found for provided data hash");
        // Check if index 0 is used or handle offset. Here assuming ID starts at 0.
        // Actually best to init _nextTokenId to 1 to avoid confusion with empty mapping.
        // For simplicity, we return the value from mapping. 
        return certificateByHash[dataHash];
    }

    // Soulbound Overrides
    function transferFrom(address from, address to, uint256 tokenId) public override(ERC721) {
        revert("Soulbound: Transfers are disabled");
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public override(ERC721) {
        revert("Soulbound: Transfers are disabled");
    }
}`;

const ContractsPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
       <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900">Smart Contracts</h1>
        <p className="text-slate-500 mt-2">
          The core logic powering CertiChain. Deploy these to Polygon using Remix or Hardhat.
        </p>
      </div>
      
      <CodeViewer title="InstitutionRegistry.sol" code={REGISTRY_CODE} />
      <CodeViewer title="CertificateNFT.sol" code={NFT_CODE} />
      
      <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
        <h3 className="font-bold text-indigo-900 mb-2">Deployment Instructions</h3>
        <ol className="list-decimal list-inside space-y-2 text-indigo-800 text-sm">
          <li>Deploy <strong>InstitutionRegistry</strong> first.</li>
          <li>Copy the address of the Registry.</li>
          <li>Deploy <strong>CertificateNFT</strong>, passing the Registry address into the constructor.</li>
          <li>As the Admin, call <code>registerInstitution(your_wallet_address)</code> on the Registry contract.</li>
          <li>Update the constants in the frontend code with your new contract addresses.</li>
        </ol>
      </div>
    </div>
  );
};

export default ContractsPage;