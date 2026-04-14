# 🛡️ HeartCare AI: Decentralized Medical Records

A premium, secure, and transparent Decentralized Application (DApp) for managing medical records using **Ethereum Blockchain** and **IPFS Storage**. 

This project empowers patients with absolute control over their health data while providing doctors with a seamless, blockchain-verified medical registry.

## ✨ Key Features

- **🔐 Privacy First**: Only authorized doctors can upload or view patient records.
- **📜 Smart Contract Security**: Role-based access control (RBAC) managed by Solidity contracts.
- **📁 Decentralized Storage**: Medical documents are stored on IPFS, ensuring data permanence and integrity.
- **🌓 Premium UI/UX**: Dual-theme system (Light/Dark mode) with a "Soft Paper" premium aesthetic.
- **📱 Responsive Design**: Fully optimized Glassmorphism interface for all devices.
- **🔄 State-of-the-art Navigation**: Integrated "Role Switching" without wallet disconnection.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React.js, Ethers.js, CSS3 (Glassmorphism) |
| **Backend** | Node.js, Express.js |
| **Blockchain** | Solidity, Hardhat |
| **Storage** | IPFS (InterPlanetary File System) |
| **Wallet** | MetaMask |

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/Gautammangesh/BlockChainMiniProject.git
cd BlockChainMiniProject
```

### 2. Smart Contract Setup (Hardhat)
```bash
cd smart-contract
npm install
npx hardhat node
# In a new terminal, deploy the contract:
npx hardhat run scripts/deploy.js --network localhost
```

### 3. Backend Setup
```bash
cd backend
npm install
# Configure your .env (Add IPFS keys if available)
npm run dev
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 📖 User Workflow

1.  **Patient Login**: Connect MetaMask and select the "Patient Portal".
2.  **Grant Access**: Enter a Doctor's wallet address to authorize them to manage your records.
3.  **Doctor Login**: Switch account in MetaMask and select "Medical Provider".
4.  **Upload**: Upload a PDF/Image for the authorized patient. The file is anchored to IPFS and the hash is stored on the Blockchain.
5.  **View**: The Patient can instantly see the new record in their "Health Records" vault with a timestamped digital certificate.

---

## 🌓 Theming System

The app features a custom CSS variable-based theming system. Toggle between **Midnight Deep** and **Soft Paper** using the moon/sun icon in the navigation bar. Your preference is persisted across sessions using `localStorage`.

---

**Developed with ❤️ for Advanced Blockchain Research.**
