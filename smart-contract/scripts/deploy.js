const hre = require('hardhat');

async function main() {
  const MedicalRecords = await hre.ethers.getContractFactory('MedicalRecords');
  const contract = await MedicalRecords.deploy();
  await contract.deployed();
  console.log('MedicalRecords deployed to:', contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
