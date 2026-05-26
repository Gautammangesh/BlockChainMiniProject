require("@nomicfoundation/hardhat-ethers");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {},
    localhost: {
      url: process.env.RPC_URL || "http://127.0.0.1:7545",
      chainId: Number(process.env.CHAIN_ID || 1337),
    },
  },
};
