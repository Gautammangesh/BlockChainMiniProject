import { useState } from "react";
import { uploadRecord } from "../services/api";

function Upload() {
  const [file, setFile] = useState(null);
  const [patient, setPatient] = useState("");

  const handleUpload = async () => {
    if (!file || !patient) return;
    const data = { file, patient };
    await uploadRecord(data);
    alert("Uploaded");
  };

  return (
    <div>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <input
        type="text"
        placeholder="Patient Address"
        onChange={(e) => setPatient(e.target.value)}
      />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
}

export default Upload;
