import { ethers } from 'ethers';
import medicalRecordsAbi from '../abi/MedicalRecords.json';

export async function getContract(provider, writable = false) {
  if (!window.ethereum) throw new Error('MetaMask not installed');
  const walletProvider = provider || new ethers.BrowserProvider(window.ethereum);
  const runner = writable ? await walletProvider.getSigner() : walletProvider;
  return new ethers.Contract(medicalRecordsAbi.address, medicalRecordsAbi.abi, runner);
}

export async function connectWallet() {
  if (!window.ethereum) throw new Error('MetaMask not installed');
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  return accounts[0];
}

export async function loadProfile(provider, account) {
  const contract = await getContract(provider, false);
  const doctor = await contract.doctors(account);
  const patient = await contract.patients(account);

  if (doctor.registered) {
    return {
      role: "doctor",
      profile: {
        name: doctor.name,
        specialty: doctor.specialty,
      },
    };
  }

  if (patient.registered) {
    return {
      role: "patient",
      profile: {
        name: patient.name,
      },
    };
  }

  return {
    role: "unregistered",
    profile: null,
  };
}
