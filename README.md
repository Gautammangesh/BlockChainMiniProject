# MediChain Consent

A blockchain-enabled medical records DApp for doctor-patient consent, record sharing, and verifiable history. The system uses a Solidity smart contract to manage access permissions, a React frontend for user workflows, and a Node.js backend for IPFS file handling and API support.

## Why Choose This System?

- Patient-first access control: patients approve or revoke doctor access on-chain.
- Transparent audit trail: access requests, approvals, revocations, and record additions are logged as events.
- Permissioned record sharing: only authorized doctors can add medical entries for a patient.
- Local development ready: Ganache, Hardhat, and MetaMask are configured for a fast demo flow.
- IPFS-ready storage: file metadata is anchored with hashes, with mock support for local testing.

## Core Features

- Doctor registration with `name` and `specialty`
- Patient registration with `name`
- Doctor access request workflow
- Patient approve, reject, or revoke doctor access
- Authorized doctor adds medical records
- Patient and authorized doctor can view patient entries
- Event-driven contract audit trail
- Wallet session and network awareness in frontend

## Use Cases

- Secure telemedicine record sharing between doctors and patients.
- Patient-controlled access to medical summaries and reports.
- Proof of authorized care history for audits and compliance.
- Demonstration of consent-based health data management on blockchain.
- Prototype for decentralized medical record systems and access workflows.

## System Overview

- `frontend/` — React + Vite application with MetaMask integration.
- `backend/` — Express API for IPFS upload support and middleware.
- `smart-contract/` — Solidity contract managing registration, access, and medical entries.
- `frontend/src/abi/MedicalRecords.json` — ABI and deployment data consumed by the UI.
- `backend/services/abi.json` — contract ABI used by the backend when required.

## IPFS Support

This project supports IPFS for storing file metadata and linking medical entries to content hashes.

What is already implemented:

- `backend/services/ipfsService.js` uploads file data to IPFS using `ipfs-http-client`.
- `backend/controllers/recordController.js` calls `uploadToIPFS(file)` when records are uploaded.
- The smart contract stores an `ipfsHash` for each medical entry.
- When real IPFS is not configured, the backend returns a mock hash for local demo mode.

What you need for real IPFS uploads:

- An IPFS provider account, such as Infura IPFS.
- `IPFS_PROJECT_ID` and `IPFS_PROJECT_SECRET` set in `backend/.env`.
- The backend running with environment variables loaded from `.env`.
- A valid upload flow from the frontend to `backend/api/upload`.

How to enable real IPFS support:

1. Copy `backend/.env.example` to `backend/.env`.
2. Replace `YOUR_INFURA_IPFS_PROJECT_ID` and `YOUR_INFURA_IPFS_PROJECT_SECRET` with your Infura keys.
3. Restart the backend server.
4. Upload a file through the app; the backend will return a real CID instead of `QmMockHash1234567890`.

If credentials are missing, the app still works in demo mode, but the returned IPFS hash is only a placeholder and not resolvable through gateways like `https://ipfs.io/ipfs/`.

## Quick Start

### Prerequisites

- Node.js 18+ installed
- Ganache running locally
- MetaMask installed in browser

### 1. Run Ganache

Start Ganache with a local RPC endpoint:

- RPC URL: `http://127.0.0.1:7545`
- Chain ID: `1337`

### 2. Deploy the Smart Contract

```bash
cd smart-contract
npm install
npm run compile
npm test
npm run deploy
```

This deploy step writes ABI and address data for frontend and backend use.

### 3. Start the Backend

```bash
cd backend
npm install
npm run dev
```

Optional: copy `backend/.env.example` to `.env` and add IPFS credentials for real uploads.

### 4. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Open the app at `http://localhost:5173`.

## MetaMask Setup

Add a custom network for Ganache:

- Network name: `Ganache Local`
- RPC URL: `http://127.0.0.1:7545`
- Chain ID: `1337`
- Currency symbol: `ETH`

Import one or more Ganache accounts using private keys.

## Recommended Development Workflow

1. Start Ganache.
2. Compile and deploy the contract from `smart-contract/`.
3. Start the backend server in `backend/`.
4. Start the frontend dev server in `frontend/`.
5. Use MetaMask to connect and test patient/doctor flows.
6. Update the contract, recompile, and redeploy as needed.
7. Run frontend and backend tests after changes.

## Smart Contract Documentation

For contract-level design, events, and function details, see `smart-contract/README.md`.

## Useful Commands

```bash
cd smart-contract && npm install
cd smart-contract && npm run compile
cd smart-contract && npm test
cd smart-contract && npm run deploy
cd backend && npm install
cd backend && npm run dev
cd frontend && npm install
cd frontend && npm run dev
```

## Notes

- The backend is primarily used for file metadata and IPFS support.
- Access controls are enforced by the smart contract on-chain.
- The frontend should be connected to the Ganache network and MetaMask account before use.
- This repository is built for rapid prototyping and local demos.
