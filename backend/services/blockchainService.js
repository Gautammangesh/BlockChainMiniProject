const { ethers } = require("ethers");
const abi = require("./abi.json");

const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8545";
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "CONTRACT_ADDRESS";

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const signer = provider.getSigner();

const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

exports.addRecord = async (patient, hash) => {
  await contract.addRecord(patient, hash);
};

exports.fetchRecords = async (patient) => {
  return await contract.getRecords(patient);
};
