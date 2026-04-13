import { ethers } from 'ethers';
import medicalRecordsAbi from '../abi/MedicalRecords.json';

export async function getContract(address) {
  if (!window.ethereum) throw new Error('MetaMask not installed');
  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send('eth_requestAccounts', []);
  const signer = await provider.getSigner();
  return new ethers.Contract(address, medicalRecordsAbi, signer);
}

export async function connectWallet() {
  if (!window.ethereum) throw new Error('MetaMask not installed');
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  return accounts[0];
}
