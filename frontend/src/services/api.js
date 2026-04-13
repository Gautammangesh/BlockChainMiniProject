import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

export const uploadRecord = (data) => API.post("/records/upload", data);
export const getRecords = (address) => API.get(`/records/${address}`);

export default API;
