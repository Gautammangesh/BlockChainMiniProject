const { ethers } = require("ethers");
let artifacts;
try {
  artifacts = require("./abi.json");
} catch (e) {
  artifacts = { address: "", abi: [] };
}

const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8545";
const CONTRACT_ADDRESS = artifacts.address;

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
// For backend server calls, we typically use a defined signer/wallet.
// But for local hardhat testing, provider.getSigner() works if it's the node's account.
const signer = provider.getSigner();

const contract = new ethers.Contract(CONTRACT_ADDRESS, artifacts.abi, signer);

exports.addRecord = async (patient, hash, description) => {
  const tx = await contract.uploadRecord(patient, hash, description);
  return await tx.wait();
};

exports.fetchRecords = async (patient) => {
  return await contract.getPatientRecords(patient);
};
