import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

export const uploadMedicalFile = (data) => API.post("/records/upload", data);
export const getPatientEntries = (address) => API.get(`/records/${address}`);
export const getPatientRequests = (address) => API.get(`/records/patient/${address}/requests`);
export const getPendingRequests = (address) => API.get(`/records/patient/${address}/pending`);
export const getAccessStatus = (patient, doctor) => API.get(`/records/access/${patient}/${doctor}`);

export default API;
