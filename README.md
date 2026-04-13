# Medical Records DApp

## Project Title
Design and Development of a Blockchain-Based Medical Records Management System using Ethereum and IPFS

## Purpose
This project implements a decentralized application (DApp) for secure medical record management. It uses Ethereum smart contracts for access control and IPFS for decentralized file storage. The backend API layer handles IPFS and blockchain calls, while the frontend provides the user interface.

## Architecture
Frontend (React) -> Backend API (Node.js) -> Blockchain (Ethereum Smart Contract) -> IPFS (File Storage)

## Folder Structure
- `smart-contract/`
  - `contracts/`
    - `MedicalRecords.sol` -- Solidity smart contract for patient records and permissions.
  - `scripts/`
    - `deploy.js` -- deployment helper for contracts.
  - `hardhat.config.js` -- Hardhat configuration.
- `backend/`
  - `controllers/`
    - `recordController.js` -- request handlers for upload and fetch.
  - `routes/`
    - `recordRoutes.js` -- API endpoints.
  - `services/`
    - `ipfsService.js` -- IPFS client logic.
    - `blockchainService.js` -- contract calls.
    - `abi.json` -- contract ABI placeholder.
  - `app.js` -- Express app entry.
  - `package.json` -- backend dependencies.
- `frontend/`
  - `package.json` -- frontend dependencies and scripts.
  - `index.html` -- React app entry page.
  - `src/`
    - `main.jsx` -- app bootstrap.
    - `App.jsx` -- main UI layout.
    - `App.js` -- App alias for reference.
    - `index.js` -- index alias for reference.
    - `components/`
      - `Upload.jsx` -- upload UI.
      - `View.jsx` -- view records UI.
      - `Access.jsx` -- grant/revoke UI.
    - `services/`
      - `api.js` -- backend API client.
    - `abi/` -- compiled contract ABI placeholder.
    - `utils/` -- blockchain + IPFS helper modules.

## Implementation Plan
1. Setup development environment
   - Install Node.js and npm.
   - Install MetaMask browser extension.
   - Install Hardhat or Remix for Solidity compilation and deployment.

2. Create smart contract
   - `smart-contract/contracts/MedicalRecords.sol`
   - Define roles: patient, doctor, admin.
   - Store record metadata, IPFS hash, access permissions.

3. Setup backend API
   - Initialize Node.js app in `backend/`.
   - Add IPFS upload service.
   - Add blockchain service for contract calls.

4. Setup frontend
   - Initialize React app in `frontend/`.
   - Add `ethers` for blockchain interaction.
   - Add API client to call backend.

5. Implement workflow
   - Doctor uploads file -> encrypts locally -> IPFS stores file -> returns hash.
   - Backend stores metadata and grant access using smart contract.
   - Patient views uploaded records and grants/revokes access.
   - Authorized doctor reads the record hash and fetches the file from IPFS.

6. Test and deploy
   - Test locally on Hardhat/Goerli.
   - Deploy contract.
   - Connect backend and frontend to deployed contract address.

## Next Steps
- Complete the smart contract logic.
- Build the React UI screens.
- Integrate IPFS upload and encrypted storage.
- Test full doctor/patient access flow.
# BlockChainMiniProject
