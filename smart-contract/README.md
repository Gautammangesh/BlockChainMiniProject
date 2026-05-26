# MediChain Consent Smart Contract

This folder contains the Solidity contract and Hardhat deployment scripts used by the MediChain Consent DApp.

## Purpose

The smart contract manages doctor and patient registration, consent flows, and permissioned access to medical records. It enforces access control on-chain so only authorized doctors can add records and only patients can approve, reject, or revoke access.

## Key Concepts

- Doctor registration and doctor metadata
- Patient registration
- Doctor access requests to a patient
- Patient approval or rejection of requests
- Patient revocation of existing doctor access
- Authorized doctor entry creation with IPFS hash metadata
- Record reads guarded by authorization checks

## Core Functions

- `registerDoctor(string name, string specialty)`
  - Register a wallet as a doctor with name and specialty.

- `registerPatient(string name)`
  - Register a wallet as a patient.

- `requestAccess(address patient, string message)`
  - A registered doctor requests access to a patient.

- `respondToRequest(address doctor, bool approve)`
  - The patient approves or rejects a pending request from a doctor.

- `revokeAccess(address doctor)`
  - The patient revokes a previously authorized doctor.

- `addMedicalEntry(address patient, string entryType, string ipfsHash, string title, string notes)`
  - An authorized doctor adds a medical entry referencing IPFS content.

- `getPatientEntries(address patient)`
  - Returns patient entries only if the caller is the patient or an authorized doctor.

- `getPendingRequests(address patient)`
  - Patient-only view of pending doctor access requests.

- `getPatientRequests(address patient)`
  - Returns all requests from doctors for a patient.

- `isAuthorized(address patient, address doctor)`
  - Query whether a doctor is authorized for a patient.

## Events

- `DoctorRegistered(address indexed doctor, string name, string specialty)`
- `PatientRegistered(address indexed patient, string name)`
- `AccessRequested(address indexed doctor, address indexed patient, string message)`
- `AccessResponded(address indexed patient, address indexed doctor, bool approved)`
- `AccessRevoked(address indexed patient, address indexed doctor)`
- `MedicalEntryAdded(address indexed doctor, address indexed patient, string entryType, string ipfsHash, string title)`

## Local Development

### Install dependencies

```bash
cd smart-contract
npm install
```

### Compile

```bash
npm run compile
```

### Run tests

```bash
npm test
```

### Deploy to Ganache

```bash
npm run deploy
```

This deploys the contract to the local Ganache network and updates the ABI/address references used by the frontend and backend.

## Notes for Reviewers

- Access control is enforced in contract functions and read methods.
- The contract stores medical history entries per patient in an array.
- The DApp frontend uses contract state to display role-specific workflows and consent flows.
- The backend is primarily used for IPFS support and does not enforce authorization independently.
