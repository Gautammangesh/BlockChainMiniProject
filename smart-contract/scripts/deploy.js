const hre = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const MedicalRecords = await hre.ethers.getContractFactory('MedicalRecords');
  const contract = await MedicalRecords.deploy();

  // Ethers v6 usage
  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log('MedicalRecords deployed to:', address);

  // Export artifacts
  const artifacts = {
    address: address,
    abi: JSON.parse(contract.interface.formatJson()),
  };

  const backendPath = path.join(__dirname, '../../backend/services/abi.json');
  const frontendPath = path.join(__dirname, '../../frontend/src/abi/MedicalRecords.json');

  // Ensure directories exist
  const frontendDir = path.dirname(frontendPath);
  if (!fs.existsSync(frontendDir)) {
    fs.mkdirSync(frontendDir, { recursive: true });
  }

  fs.writeFileSync(backendPath, JSON.stringify(artifacts, null, 2));
  fs.writeFileSync(frontendPath, JSON.stringify(artifacts, null, 2));

  console.log('ABI and Address exported to backend and frontend.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
