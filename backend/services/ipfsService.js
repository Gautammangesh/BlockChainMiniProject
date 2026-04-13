const { create } = require("ipfs-http-client");

const client = create({ url: "https://ipfs.infura.io:5001/api/v0" });

exports.uploadToIPFS = async (file) => {
  const added = await client.add(file);
  return added.path;
};
