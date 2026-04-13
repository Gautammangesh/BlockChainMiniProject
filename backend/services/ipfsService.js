require("dotenv").config();
let client;
try {
  const { create } = require("ipfs-http-client");
  const projectId = process.env.IPFS_PROJECT_ID;
  const projectSecret = process.env.IPFS_PROJECT_SECRET;

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
  if (!projectId || !projectSecret) {
    console.warn("IPFS credentials missing. Returning mock hash for testing.");
    return "QmMockHash1234567890";
  }
  const added = await client.add(file);
  return added.path;
};
