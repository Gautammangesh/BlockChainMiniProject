const { ethers } = require("ethers");
let artifacts;
try {
  artifacts = require("./abi.json");
} catch (e) {
  artifacts = { address: "", abi: [] };
}

const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:7545";
const CONTRACT_ADDRESS = artifacts.address;

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const contract = new ethers.Contract(CONTRACT_ADDRESS, artifacts.abi, provider);

exports.fetchRecords = async (patient) => {
  return await contract.getPatientEntries(patient, { from: patient });
};

exports.fetchPendingRequests = async (patient) => {
  return await contract.getPendingRequests(patient, { from: patient });
};

exports.fetchPatientRequests = async (patient) => {
  return await contract.getPatientRequests(patient, { from: patient });
};

exports.fetchAccessStatus = async (patient, doctor) => {
  return await contract.isAuthorized(patient, doctor);
};
