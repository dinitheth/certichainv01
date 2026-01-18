# CertiChain - Decentralized Academic Credential Verification

## Overview

CertiChain is a blockchain-based platform for issuing, verifying, and managing academic certificates as Soulbound Tokens (SBTs) on the Polygon network. The application enables educational institutions to mint non-transferable NFTs representing academic credentials, which students hold in their wallets and employers can instantly verify on-chain.

The core problem solved is credential fraud and inefficient verification processes. By tokenizing credentials on an immutable blockchain, certificates cannot be forged or altered, and verification becomes instant and programmatic.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 6.x for fast development and bundling
- **Styling**: Tailwind CSS (loaded via CDN in development, with custom CSS file)
- **Routing**: Custom state-based routing using React useState (no React Router)
- **Icons**: Lucide React for consistent iconography

### Blockchain Integration
- **Web3 Library**: Wagmi v3 + viem for Ethereum interactions
- **Query Management**: TanStack React Query for caching blockchain data
- **Network**: Polygon Amoy testnet (configured in wagmiConfig.ts)
- **Wallet Connection**: Injected connector supporting MetaMask, OKX, and other EIP-1193 wallets
- **Contract Interaction**: Read operations via @wagmi/core readContract, write operations via wagmi hooks

### Smart Contract Architecture
- **InstitutionRegistry**: Ownable contract managing authorized institutions
  - Only owner can register/remove institutions
  - Maintains list of all institutions (active and inactive)
- **CertificateNFT**: Soulbound token contract for credentials
  - Issues certificates with hashed student data for privacy
  - Supports revocation with reason tracking
  - Stores IPFS hash for extended metadata
  - Uses dataHash for certificate lookup by original data

### Data Privacy Pattern
- Student PII (name, email) is hashed using keccak256 before on-chain storage
- Full metadata can be stored on IPFS with only the CID stored on-chain
- Verification can be done by reconstructing the hash from original data

### Page Structure
- **Home**: Landing page with product overview
- **IssueCertificate**: Institution-facing form for minting certificates
- **VerifyCertificate**: Public verification by token ID or data hash
- **AdminDashboard**: Owner-only institution management
- **ContractsPage**: Smart contract source code viewer

## External Dependencies

### Blockchain Services
- **Polygon Amoy Testnet**: Target deployment network (chain ID in wagmiConfig)
- **IPFS/Pinata**: Off-chain metadata storage (gateway: gateway.pinata.cloud)

### NPM Packages
- wagmi + viem: Ethereum interaction layer
- @tanstack/react-query: Async state management
- ethers: Utility library (v6.11.1)
- lucide-react: Icon library

### Environment Variables
- `GEMINI_API_KEY`: Referenced in vite.config.ts (purpose unclear from codebase, possibly for AI features)

### Contract Addresses
- Contracts use placeholder addresses (0x000...000) in constants.ts
- Actual deployed addresses must be configured before production use