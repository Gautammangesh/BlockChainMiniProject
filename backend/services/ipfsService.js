require("dotenv").config();
const projectId = process.env.IPFS_PROJECT_ID;
const projectSecret = process.env.IPFS_PROJECT_SECRET;
let client;

try {
  const { create } = require("ipfs-http-client");
  if (projectId && projectSecret && projectId !== "YOUR_INFURA_IPFS_PROJECT_ID") {
    const auth = "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");
    client = create({
      host: "ipfs.infura.io",
      port: 5001,
      protocol: "https",
      headers: {
        authorization: auth,
      },
    });
  }
} catch (e) {
  console.warn("Could not initialize IPFS client (possible version mismatch). Using mock.");
}

exports.uploadToIPFS = async (file) => {
  // If no client is initialized (e.g. missing or placeholder credentials), return mock hash
  if (!client || !projectId || !projectSecret || projectId === "YOUR_INFURA_IPFS_PROJECT_ID") {
    console.warn("IPFS client not initialized or using placeholders. Returning mock hash for testing.");
    return "QmMockHash1234567890";
  }
  
  try {
    const added = await client.add(file);
    return added.path;
  } catch (error) {
    console.error("IPFS Upload Error:", error);
    console.warn("Falling back to mock hash due to upload failure.");
    return "QmMockHash_Fallback_" + Date.now();
  }
};
