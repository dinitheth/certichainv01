# CertiChain: Decentralized Academic Credential Verification

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Solidity](https://img.shields.io/badge/Solidity-363636?style=flat&logo=solidity&logoColor=white)
![Polygon](https://img.shields.io/badge/Polygon-8247E5?style=flat&logo=polygon&logoColor=white)

**CertiChain** is a blockchain-based platform designed to issue, verify, and manage academic certificates and transcripts as **Soulbound Tokens (SBTs)**. By leveraging the Polygon network and PostgreSQL database, CertiChain ensures that academic credentials are tamper-proof, instantly verifiable, and owned permanently by the student.

---

## Table of Contents

- [Overview](#overview)
- [Why CertiChain?](#why-certichain)
- [Key Features](#key-features)
- [Real-World Use Cases](#real-world-use-cases)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Smart Contract Design](#smart-contract-design)
- [Getting Started](#getting-started)
- [Database Setup](#database-setup)
- [Usage Guide](#usage-guide)
- [Recent Updates](#recent-updates)

---

## Overview

Traditional academic verification processes are slow, expensive, and prone to fraud. Paper certificates can be lost or forged, and centralized databases are siloed and vulnerable to downtime or attacks.

CertiChain solves this by tokenizing credentials. When an institution issues a certificate, it is minted as a non-transferable NFT (Soulbound Token) directly to the student's wallet. Employers and third parties can verify these credentials instantly on-chain without needing to contact the issuing university.

---

## Why CertiChain?

### The Problem
1.  **Credential Fraud:** Fake degrees cost the global economy billions and undermine trust in educational institutions.
2.  **Inefficiency:** Background checks often take weeks and require manual communication with registrar offices.
3.  **Lack of Ownership:** Students do not truly own their data; it resides on university servers. If the university closes, the record may be lost.

### The Solution
1.  **Immutability:** Once minted on the blockchain, a certificate cannot be altered or backdated.
2.  **Instant Verification:** Verification is programmatic and instant. No phone calls or emails required.
3.  **Sovereignty:** Students hold their credentials in their own non-custodial wallets.

---

## Key Features

*   **Soulbound Tokens (SBTs):** Certificates are ERC-721 tokens that **cannot be transferred** between wallets, ensuring that a degree cannot be "sold" to another person.
*   **Role-Based Access Control:** Only authorized institutions (whitelisted by the Admin) can issue certificates.
*   **Institution Registration System:** Off-chain registration workflow with approval process before on-chain authorization.
*   **Privacy-Preserving Verification:** Capability to verify credentials using hashed data (Name + Email + Course) without publicly exposing PII (Personally Identifiable Information) on the UI by default.
*   **Automated Gas Optimization:** Smart gas limit settings to prevent transaction failures.
*   **User-Friendly Error Handling:** Clear, actionable error messages instead of technical blockchain errors.
*   **Real-Time History Monitoring:** Live blockchain event tracking for all certificate actions.
*   **Revocation Mechanism:** Institutions can revoke certificates in cases of academic dishonesty or administrative error.

---

## Real-World Use Cases

1.  **University Degree Issuance:** Large universities issuing thousands of degrees annually.
2.  **Bootcamp Certifications:** Coding bootcamps issuing completion certificates that employers can trust.
3.  **Employee Background Checks:** HR departments verifying a candidate's claims instantly.
4.  **Professional Licensing:** Medical or legal boards issuing licenses that must be publicly verifiable and revocable.

---

## System Architecture

The system consists of a React frontend, a Node.js/Express backend API, PostgreSQL database, and two core Smart Contracts on Polygon.

```mermaid
graph TD
    User[User / Browser]
    
    subgraph Frontend
        App[React Application]
        Wagmi[Wagmi / Viem SDK]
    end

    subgraph Backend
        API[Express API Server]
        DB[(PostgreSQL Database)]
    end

    subgraph Blockchain [Polygon Network]
        Registry[InstitutionRegistry Contract]
        NFT[CertificateNFT Contract]
    end

    User -->|Interacts| App
    App -->|Connects Wallet| Wagmi
    App -->|Registration API| API
    API -->|Stores Data| DB
    Wagmi -->|Read/Write| Registry
    Wagmi -->|Read/Write| NFT
    Registry -->|Authorizes| NFT
    
    %% Relationships
    NFT -->|Mints SBT| User
```

### Data Flow
1.  **Institution** submits registration request through the frontend.
2.  **Backend API** stores registration in PostgreSQL with "pending" status.
3.  **Admin** reviews and approves the registration in the Admin Dashboard.
4.  **Admin** adds Institution address to the `InstitutionRegistry` on-chain.
5.  **Institution** can now issue certificates by calling `issueCertificate` on `CertificateNFT`.
6.  **Contract** checks `InstitutionRegistry` for permission.
7.  **Contract** mints Soulbound Token to **Student Wallet**.
8.  **Verifier** queries the blockchain using the Certificate ID or Data Hash.

---

## Tech Stack

### Frontend
*   **Framework:** React 18
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **Icons:** Lucide React
*   **Build Tool:** Vite

### Backend
*   **Runtime:** Node.js
*   **Framework:** Express
*   **Database:** PostgreSQL (Neon, Supabase, or local)
*   **ORM:** Drizzle ORM
*   **Language:** TypeScript

### Blockchain Interaction
*   **Library:** Wagmi & Viem (Modern replacements for Ethers.js)
*   **State Management:** TanStack Query
*   **Wallet Connection:** Injected Connectors (MetaMask, OKX, etc.)

### Smart Contracts
*   **Language:** Solidity ^0.8.20
*   **Standard:** ERC-721 (Non-Fungible Token)
*   **Security:** OpenZeppelin Contracts (Ownable, ERC721)
*   **Network:** Polygon Amoy (Testnet) / Polygon PoS (Mainnet)

---

## Smart Contract Design

### 1. InstitutionRegistry.sol
Acts as the gatekeeper.
*   **`registerInstitution(address)`**: Whitelists an address.
*   **`removeInstitution(address)`**: Revokes issuing rights.
*   **`isAuthorized(address)`**: Returns true/false.
*   **`getInstitution(address)`**: Returns institution name and active status.

### 2. CertificateNFT.sol
The core logic for credentials.
*   **Inherits:** ERC721, Ownable.
*   **Overrides:** `transferFrom` and `safeTransferFrom` revert to ensure **Soulbound** status.
*   **`issueCertificate(...)`**: Mints token. Requires `registry.isAuthorized(msg.sender)`.
*   **`revokeCertificate(...)`**: Invalidates the struct data without burning the token (audit trail).
*   **Hashing:** Stores `keccak256` hashes of sensitive data for privacy checks.
*   **Gas Optimization:** Configured with optimal gas limits (500,000 for issuance, 200,000 for revocation).

---

## Getting Started

### Prerequisites
*   Node.js (v18+)
*   PostgreSQL database (Neon, Supabase, Railway, or local installation)
*   MetaMask (Browser Extension)
*   Polygon Amoy Testnet MATIC (for gas fees)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/certichain.git
    cd certichain
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env` file in the root directory:
    ```env
    DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
    ```
    Replace with your actual PostgreSQL connection string from Neon, Supabase, or your local database.

4.  **Setup Database Schema**
    Push the database schema to your PostgreSQL database:
    ```bash
    npm run db:push
    ```
    
    Alternatively, you can run the SQL setup manually:
    ```bash
    psql -U your_username -d your_database -f database_setup.sql
    ```

5.  **Start Backend Server**
    ```bash
    npm run server
    ```
    The API server will run on `http://localhost:3001`

6.  **Start Frontend Development Server**
    ```bash
    npm run dev
    ```
    The frontend will run on `http://localhost:5000`

---

## Database Setup

CertiChain uses PostgreSQL to manage institution registrations and optional certificate tracking. The database schema includes:

### Tables

#### 1. institution_registrations
Stores all institution registration requests with approval workflow.
*   `id` - Primary key
*   `name` - Institution name
*   `email` - Official contact email
*   `website` - Institution website
*   `location` - Geographic location
*   `description` - Brief description
*   `wallet_address` - Ethereum wallet address (unique)
*   `status` - pending | approved | rejected
*   `created_at` - Timestamp of submission
*   `reviewed_at` - Timestamp of admin review

#### 2. certificates (Optional)
Off-chain tracking for certificates (blockchain is the source of truth).
*   `token_id` - NFT token ID
*   `student_name_hash` - Hashed student name
*   `student_email_hash` - Hashed student email
*   `student_wallet` - Student's wallet address
*   `course` - Degree/course name
*   `enrollment_date` - Enrollment timestamp
*   `issuer_wallet` - Institution's wallet
*   `is_revoked` - Revocation status
*   `transaction_hash` - Blockchain transaction hash

### Database Providers

You can use any PostgreSQL provider:
*   **Neon** (Recommended): https://neon.tech - Serverless PostgreSQL
*   **Supabase**: https://supabase.com - PostgreSQL with additional features
*   **Railway**: https://railway.app - Simple deployment platform
*   **Local PostgreSQL**: Traditional self-hosted setup

---

## Usage Guide

### 1. Institution Registration
1.  Visit the platform and connect your wallet.
2.  Navigate to **Register Institution** page.
3.  Fill in your institution details:
    - Institution Name
    - Official Email
    - Website URL
    - Location
    - Brief Description
4.  Submit the registration request.
5.  Wait for admin approval (status shown on page).

### 2. Administrator Approval
1.  Connect wallet with admin privileges.
2.  Navigate to the **Admin** tab.
3.  Review pending institution registrations.
4.  Approve or reject requests.
5.  For approved institutions, register their wallet address on-chain using the Registry contract.

### 3. Certificate Issuance
1.  Connect the wallet authorized in the previous step.
2.  Navigate to **Institution** tab.
3.  Fill in certificate details:
    - Student Name (hashed on-chain for privacy)
    - Student Email (hashed)
    - Student Wallet Address
    - Course/Degree Name
    - Enrollment Date
4.  Click **Mint Certificate**.
5.  Confirm transaction in MetaMask (gas fees will be automatically optimized).
6.  Transaction success confirmation will appear.

### 4. Certificate Verification
1.  Navigate to **Verify** tab.
2.  **Mode A (By ID):** Enter the Certificate Token ID.
3.  **Mode B (Privacy Mode):** Enter Student Name, Email, Course, and Date. The app generates a hash locally and queries the blockchain.
4.  View the certificate status:
    - ✅ Valid and Active
    - ❌ Revoked (with reason)
    - ⚠️ Not Found

### 5. Certificate Revocation
1.  From the **Institution Dashboard**.
2.  Enter the Certificate ID to revoke.
3.  Provide a reason for revocation.
4.  Confirm the transaction.
5.  Certificate status is immediately updated on-chain.

### 6. Blockchain History
1.  Navigate to **History** tab.
2.  View real-time log of all certificate actions:
    - Issuance events
    - Revocation events
3.  Click transaction links to view on Polygon Explorer.

---

## Recent Updates

### Version 2.0 - Major Improvements

#### Frontend Enhancements
*   **Redesigned Home Page**: Modern, professional design with enhanced features section
*   **Wallet-Gated Access**: Institution Dashboard only accessible after wallet connection
*   **Improved Error Messages**: User-friendly error handling for rejected transactions
*   **Removed IPFS Requirement**: Simplified issuance flow (uses placeholder)

#### Backend Infrastructure
*   **PostgreSQL Database**: Complete off-chain data management
*   **Express API Server**: RESTful API for institution registrations
*   **Registration Workflow**: Approval system before on-chain authorization

#### Smart Contract Optimization
*   **Gas Limit Configuration**: Automatic gas optimization to prevent failed transactions
    - Issuance: 500,000 gas limit
    - Revocation: 200,000 gas limit
*   **Enhanced Security**: Input validation and access control improvements

#### Developer Experience
*   **Environment Variables**: Proper `.env` configuration for database
*   **Database Migrations**: Drizzle ORM with schema versioning
*   **SQL Setup Script**: `database_setup.sql` for manual database initialization
*   **Comprehensive Documentation**: Updated README with setup instructions

### API Endpoints

The backend server provides the following endpoints:

*   `GET /api/registrations` - Get all registrations
*   `GET /api/registrations/pending` - Get pending registrations
*   `GET /api/registrations/check/:walletAddress` - Check registration status
*   `POST /api/registrations` - Submit new registration
*   `PATCH /api/registrations/:id` - Update registration status (approve/reject)

---

## Security & Audit

*   **Access Control:** Strictly enforced via `onlyOwner` and `onlyAuthorized` modifiers.
*   **Data Integrity:** Implements `keccak256` hashing for verification data to prevent tampering.
*   **Soulbound Enforcement:** All transfer functions strictly revert.
*   **Database Security:** PostgreSQL with SSL connections and parameterized queries.
*   **Input Validation:** Comprehensive validation on both frontend and backend.
*   **Error Handling:** User-friendly messages that don't expose sensitive system information.

---

## Troubleshooting

### Common Issues

**Database Connection Error**
```
Error: DATABASE_URL must be set
```
Solution: Ensure `.env` file exists with valid `DATABASE_URL`

**Transaction Failures with Low Gas**
Solution: The platform now automatically sets appropriate gas limits. Ensure you have sufficient MATIC for gas fees.

**Wallet Connection Issues**
Solution: Ensure MetaMask is installed and connected to Polygon Amoy testnet.

**Registration Not Showing**
Solution: Make sure backend server is running on port 3001.

---

## Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.

---

Built on Polygon Network with ❤️

