require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Load fhevm plugin if installed — optional for basic compile/deploy
try {
  require("@fhevm/hardhat-plugin");
} catch (e) {
  console.warn("⚠️  @fhevm/hardhat-plugin not found — FHE local testing disabled. Deploy to Sepolia still works.");
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      evmVersion: "cancun",
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
    },
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || "",
    },
  },
};
