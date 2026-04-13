import { useState } from "react";
import { getRecords } from "../services/api";

function View() {
  const [address, setAddress] = useState("");
  const [records, setRecords] = useState([]);

  const fetchRecords = async () => {
    if (!address) return;
    const res = await getRecords(address);
    setRecords(res.data);
  };

  return (
    <div>
      <input
        placeholder="Patient Address"
        onChange={(e) => setAddress(e.target.value)}
      />
      <button onClick={fetchRecords}>Get Records</button>

      {records.map((r, i) => (
        <div key={i}>
          <a href={`https://ipfs.io/ipfs/${r.ipfsHash}`}>View File</a>
        </div>
      ))}
    </div>
  );
}

export default View;
