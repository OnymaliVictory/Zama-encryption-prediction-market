export const CONTRACT_ABI = [
  {
    "inputs": [],
    "name": "marketCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "marketId", "type": "uint256" }],
    "name": "getMarket",
    "outputs": [
      { "internalType": "string",  "name": "question",       "type": "string"  },
      { "internalType": "string",  "name": "category",       "type": "string"  },
      { "internalType": "uint256", "name": "endTime",        "type": "uint256" },
      { "internalType": "uint256", "name": "totalEthPool",   "type": "uint256" },
      { "internalType": "bool",    "name": "resolved",       "type": "bool"    },
      { "internalType": "bool",    "name": "winningOutcome", "type": "bool"    },
      { "internalType": "bool",    "name": "exists",         "type": "bool"    },
      { "internalType": "uint256", "name": "betCount",       "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "marketId", "type": "uint256" },
      { "internalType": "address", "name": "user",     "type": "address" }
    ],
    "name": "getUserBetStatus",
    "outputs": [
      { "internalType": "bool",    "name": "hasBet",    "type": "bool"    },
      { "internalType": "bool",    "name": "claimed",   "type": "bool"    },
      { "internalType": "uint256", "name": "ethAmount", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllMarkets",
    "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "marketId", "type": "uint256" }],
    "name": "getMarketBettors",
    "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    // ✅ FIXED — einput types match new FHEVM contract
    "inputs": [
      { "internalType": "uint256",  "name": "marketId",        "type": "uint256" },
      { "internalType": "bytes32",  "name": "encryptedAmount", "type": "bytes32" },
      { "internalType": "bytes",    "name": "amountProof",     "type": "bytes"   },
      { "internalType": "bytes32",  "name": "encryptedChoice", "type": "bytes32" },
      { "internalType": "bytes",    "name": "choiceProof",     "type": "bytes"   }
    ],
    "name": "placeBet",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "marketId", "type": "uint256" },
      { "internalType": "bool",    "name": "outcome",  "type": "bool"    }
    ],
    "name": "resolveMarket",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "marketId", "type": "uint256" }],
    "name": "claimReward",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true,  "internalType": "uint256", "name": "marketId", "type": "uint256" },
      { "indexed": false, "internalType": "string",  "name": "question", "type": "string"  },
      { "indexed": false, "internalType": "uint256", "name": "endTime",  "type": "uint256" }
    ],
    "name": "MarketCreated",
    "type": "event"
  },
  {
    // ✅ FIXED — removed ethAmount from event
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "marketId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "user",     "type": "address" }
    ],
    "name": "BetPlaced",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true,  "internalType": "uint256", "name": "marketId", "type": "uint256" },
      { "indexed": false, "internalType": "bool",    "name": "outcome",  "type": "bool"    }
    ],
    "name": "MarketResolved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true,  "internalType": "uint256", "name": "marketId", "type": "uint256" },
      { "indexed": true,  "internalType": "address", "name": "user",     "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount",   "type": "uint256" }
    ],
    "name": "RewardClaimed",
    "type": "event"
  }
];

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";
export const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "11155111");
export const NETWORK_NAME = process.env.NEXT_PUBLIC_NETWORK_NAME || "Sepolia";