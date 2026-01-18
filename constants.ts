// In a real deployment, these would be the addresses of your deployed contracts on Polygon Amoy or Mainnet
export const REGISTRY_ADDRESS_DEFAULT = "0x4fDc794e30A89421E256EC3F288Fc0fD471fd16E"; 
export const CERTIFICATE_NFT_ADDRESS_DEFAULT = "0x43236A83599Ce79557ad218ca1aF6109B2400d31";

export const INSTITUTION_REGISTRY_ABI = [
  "function registerInstitution(address _institution) external",
  "function removeInstitution(address _institution) external",
  "function isAuthorized(address _institution) external view returns (bool)",
  "function owner() external view returns (address)",
  "function getAllInstitutions() external view returns (address[])",
  "event InstitutionRegistered(address indexed institution)",
  "event InstitutionRemoved(address indexed institution)"
] as const;

export const CERTIFICATE_NFT_ABI = [
  "function issueCertificate(address student, string memory nameHash, string memory emailHash, string memory course, uint256 enrollmentDate, string memory ipfsHash, bytes32 dataHash) external returns (uint256)",
  "function revokeCertificate(uint256 tokenId, string memory reason) external",
  "function getCertificate(uint256 tokenId) external view returns (tuple(address issuer, string studentNameHash, string studentEmailHash, string course, uint256 issueDate, uint256 enrollmentDate, bool isValid, string ipfsHash, string revokeReason))",
  "function getCertificateByHash(bytes32 dataHash) external view returns (uint256)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event CertificateIssued(uint256 indexed tokenId, address indexed issuer, address indexed student, bytes32 indexed dataHash)",
  "event CertificateRevoked(uint256 indexed tokenId, string reason)"
] as const;

// Mock data for simulation mode (Legacy/Reference)
export const MOCK_CERTIFICATES = [
  {
    id: "1",
    studentName: "0x63a...9f3 (Hash)",
    studentEmailHash: "0x89b...1c2 (Hash)",
    studentAddress: "0x123...abc",
    course: "Bachelor of Computer Science",
    issueDate: Date.now() / 1000 - 86400 * 30, // 30 days ago
    enrollmentDate: Date.now() / 1000 - 86400 * 1000, // ~3 years ago
    issuer: "0xPolyUniversity",
    isValid: true,
    ipfsHash: "QmHash123...",
    revokeReason: ""
  }
];