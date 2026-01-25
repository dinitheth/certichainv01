// In a real deployment, these would be the addresses of your deployed contracts on Polygon Amoy or Mainnet
export const REGISTRY_ADDRESS_DEFAULT = "0x36b0FC46a71C29BCae123B3a11a3B5222d7E53b5"; 
export const INSTITUTION_REGISTRY_ADDRESS_DEFAULT = "0x36b0FC46a71C29BCae123B3a11a3B5222d7E53b5";
export const CERTIFICATE_NFT_ADDRESS_DEFAULT = "0xEDE1ade75d0FBE2Ade2001966966Efd190b90C20";

export const INSTITUTION_REGISTRY_ABI = [
  {
    name: "registerInstitution",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_institution", type: "address" },
      { name: "_name", type: "string" }
    ],
    outputs: []
  },
  {
    name: "removeInstitution",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "_institution", type: "address" }],
    outputs: []
  },
  {
    name: "getInstitution",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "_institution", type: "address" }],
    outputs: [
      { name: "name", type: "string" },
      { name: "isActive", type: "bool" }
    ]
  },
  {
    name: "isAuthorized",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "_institution", type: "address" }],
    outputs: [{ name: "", type: "bool" }]
  },
  {
    name: "owner",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }]
  },
  {
    name: "getAllInstitutions",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address[]" }]
  },
  {
    name: "InstitutionRegistered",
    type: "event",
    inputs: [
      { name: "institution", type: "address", indexed: true },
      { name: "name", type: "string", indexed: false }
    ]
  },
  {
    name: "InstitutionRemoved",
    type: "event",
    inputs: [{ name: "institution", type: "address", indexed: true }]
  }
] as const;

export const CERTIFICATE_NFT_ABI = [
  {
    name: "issueCertificate",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "student", type: "address" },
      { name: "nameHash", type: "bytes32" },
      { name: "emailHash", type: "bytes32" },
      { name: "course", type: "string" },
      { name: "enrollmentDate", type: "uint256" },
      { name: "ipfsHash", type: "string" },
      { name: "dataHash", type: "bytes32" }
    ],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    name: "revokeCertificate",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "reason", type: "string" }
    ],
    outputs: []
  },
  {
    name: "getCertificate",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "issuer", type: "address" },
          { name: "studentNameHash", type: "bytes32" },
          { name: "studentEmailHash", type: "bytes32" },
          { name: "course", type: "string" },
          { name: "issueDate", type: "uint256" },
          { name: "enrollmentDate", type: "uint256" },
          { name: "isValid", type: "bool" },
          { name: "ipfsHash", type: "string" },
          { name: "revokeReason", type: "string" }
        ]
      }
    ]
  },
  {
    name: "getCertificateByHash",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "dataHash", type: "bytes32" }],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    name: "ownerOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "address" }]
  },
  {
    name: "Transfer",
    type: "event",
    inputs: [
      { name: "from", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "tokenId", type: "uint256", indexed: true }
    ]
  },
  {
    name: "CertificateIssued",
    type: "event",
    inputs: [
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "issuer", type: "address", indexed: true },
      { name: "student", type: "address", indexed: true },
      { name: "dataHash", type: "bytes32", indexed: false }
    ]
  },
  {
    name: "CertificateRevoked",
    type: "event",
    inputs: [
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "reason", type: "string", indexed: false }
    ]
  }
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