const hre = require("hardhat");

async function main() {
  const doctorAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  const [admin] = await hre.ethers.getSigners();
  
  const artifacts = require("../../backend/services/abi.json");
  const MedicalRecords = await hre.ethers.getContractAt("MedicalRecords", artifacts.address);
  
  console.log("Whitelisting doctor:", doctorAddress);
  const tx = await MedicalRecords.addDoctor(doctorAddress);
  await tx.wait();
  
  console.log("Success! Account #0 is now an authorized doctor.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
