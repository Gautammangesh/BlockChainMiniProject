import { useState } from "react";

function Access() {
  const [doctor, setDoctor] = useState("");

  const handleGrant = async () => {
    if (!doctor) return;
    alert("Access granted (placeholder)");
  };

  const handleRevoke = async () => {
    if (!doctor) return;
    alert("Access revoked (placeholder)");
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Doctor Address"
        onChange={(e) => setDoctor(e.target.value)}
      />
      <button onClick={handleGrant}>Grant</button>
      <button onClick={handleRevoke}>Revoke</button>
    </div>
  );
}

export default Access;
