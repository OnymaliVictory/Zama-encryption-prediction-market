# 🔐 ZeroKnow — Private Prediction Markets

> **Bet on the future. Your choices stay encrypted.**
> The world's first prediction market where bet amounts and YES/NO choices are fully encrypted on-chain using Zama's FHEVM.

---

## 🌐 Live Demo
**[https://zama-encryption-prediction-market.vercel.app](https://zama-encryption-prediction-market.vercel.app)**

## 📝 Smart Contract (Sepolia Testnet)
**Address:** `0x2e126c083C47a4Fd547eD4d7E435f989D823BAE1`
**Explorer:** [View on Sepolia Etherscan](https://sepolia.etherscan.io/address/0x2e126c083C47a4Fd547eD4d7E435f989D823BAE1)

---

## 🏆 Built For
**Zama Developer Program — Mainnet Season 2**
**Category:** Privacy-preserving DeFi / Prediction Markets

---

## 🔒 The Problem

On traditional prediction markets like Polymarket:
- ❌ Your bet amount is **visible to everyone** on-chain
- ❌ Your YES/NO choice is **public** before market resolves
- ❌ Whales can see your position and **front-run you**
- ❌ No financial privacy whatsoever

## ✅ The Solution — ZeroKnow

ZeroKnow uses Zama's **Fully Homomorphic Encryption (FHEVM)** to keep all bets completely private on-chain.

- ✅ Bet amount encrypted as `euint64` — unreadable on-chain
- ✅ YES/NO choice encrypted as `ebool` — nobody knows your side
- ✅ FHE computation on encrypted data — no plaintext ever stored
- ✅ Verify privacy yourself on Etherscan — only ciphertexts visible

---

## 🧠 How FHE Works in ZeroKnow

### 1. Browser Encryption
```javascript
// User's bet is encrypted BEFORE leaving the browser
const input = instance.createEncryptedInput(contractAddress, userAddress);
input.add64(BigInt(amountInGwei));  // euint64
input.addBool(choice);              // ebool (YES/NO)
const { handles, inputProof } = await input.encrypt();
// Only handles + proof are sent on-chain — never plaintext
```

### 2. Smart Contract Storage
```solidity
// Contract receives only encrypted ciphertexts
function placeBet(
    uint256 marketId,
    bytes32 encryptedAmount,  // FHE ciphertext handle
    bytes calldata amountProof,
    bytes32 encryptedChoice,  // FHE ciphertext handle
    bytes calldata choiceProof
) external payable {
    // Store encrypted values — no plaintext ever touched
    bet.encryptedAmount = encryptedAmount;
    bet.encryptedChoice = encryptedChoice;
}
```

### 3. FHE Operations Used
| Operation | Purpose |
|---|---|
| `TFHE.asEuint64(input, proof)` | Convert encrypted input to FHE integer |
| `TFHE.asEbool(input, proof)` | Convert encrypted input to FHE boolean |
| `TFHE.allowThis(handle)` | Grant contract ACL permission |
| `TFHE.select(cond, a, b)` | Encrypted if-else (no plaintext branching) |
| `TFHE.add(a, b)` | Add two encrypted integers |
| `TFHE.eq(a, b)` | Compare two encrypted values |

---

## 🔍 Verify Privacy Yourself

1. Place a bet on the **[live demo](https://zama-encryption-prediction-market.vercel.app)**
2. Copy your transaction hash from MetaMask
3. Go to [sepolia.etherscan.io](https://sepolia.etherscan.io) and paste the hash
4. Click the **Input Data** tab
5. ✅ You'll see raw encrypted hex — **not** your real amount or YES/NO choice

This proves the encryption works. No plaintext ever hits the blockchain.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| FHE Library | Zama FHEVM + TFHE-rs |
| Encryption SDK | fhevmjs |
| Smart Contracts | Solidity 0.8.24 + OpenZeppelin |
| Frontend | Next.js 14 + Tailwind CSS |
| Wallet | Ethers.js v6 + MetaMask |
| Live Market Data | Polymarket API |
| Network | Ethereum Sepolia Testnet |
| Deployment | Hardhat + Vercel |

---

## 🚀 Run Locally

```bash
# 1. Clone the repo
git clone https://github.com/OnymaliVictory/Zama-encryption-prediction-market.git
cd Zama-encryption-prediction-market

# 2. Install contract dependencies
npm install

# 3. Deploy contract to Sepolia
npm run deploy:sepolia

# 4. Setup frontend
cd frontend
npm install

# 5. Add environment variables
cp .env.local.example .env.local
# Edit .env.local with your values

# 6. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Environment Variables

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x2e126c083C47a4Fd547eD4d7E435f989D823BAE1
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_NETWORK_NAME=Sepolia
NEXT_PUBLIC_RPC_URL=your_alchemy_sepolia_rpc_url
```

Create `.env` in root:

```env
PRIVATE_KEY=your_wallet_private_key
SEPOLIA_RPC_URL=your_alchemy_sepolia_rpc_url
```

---

## 📁 Project Structure
├── contracts/
│   └── PredictionMarket.sol      ← FHE smart contract
├── scripts/
│   └── deploy.js                 ← Deploys + seeds 15 markets
├── frontend/
│   ├── app/                      ← Next.js app router
│   ├── components/
│   │   ├── Navbar.jsx            ← Wallet connect/disconnect/switch
│   │   ├── MarketsGrid.jsx       ← Live markets + Polymarket feed
│   │   ├── MarketCard.jsx        ← Individual market card
│   │   └── BettingModal.jsx      ← FHE encryption + betting UI
│   └── lib/
│       ├── fhevm.js              ← Zama encryption utilities
│       ├── contract.js           ← Ethers.js interactions
│       └── contractABI.js        ← Contract ABI + addresses
└── README.md

---

## 🎯 Key Features

- 🔐 **FHE-encrypted bets** — amounts and choices hidden on-chain
- 📡 **Live Polymarket data** — real Web3 prediction markets
- 👛 **Full wallet support** — connect, disconnect, switch wallets
- 📜 **Bet history** — masked wallet addresses for privacy
- 🔍 **Privacy verifier** — inspect your own transaction on Etherscan
- 📱 **Fully responsive** — works on all screen sizes

---

## 📄 License

MIT — Built for the Zama Developer Program Mainnet Season 2
