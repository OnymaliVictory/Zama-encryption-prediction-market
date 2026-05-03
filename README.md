# 🔒 ZeroKnow — Private Prediction Markets

> **Bet on the future. Your choices stay encrypted.**  
> Built with Zama FHEVM · Deployed on Sepolia · Next.js 14

---

## 🏆 Hackathon Submission

**Project:** ZeroKnow  
**Category:** Privacy-preserving DeFi / Prediction Markets  
**Tech:** Zama FHEVM (TFHE-rs), Solidity, Next.js 14, Ethers.js v6

### What makes this special?
- ✅ First prediction market where **YES/NO choices and bet amounts are encrypted on-chain**
- ✅ Uses `euint64` for encrypted ETH amounts, `ebool` for encrypted YES/NO
- ✅ `TFHE.select()` routes bets to encrypted pools without revealing choice
- ✅ Gateway decryption for private winner verification
- ✅ No plaintext bet data ever touches the blockchain

---

## 📁 Project Structure

```
private-prediction-market/
├── contracts/
│   └── PredictionMarket.sol      ← FHE smart contract
├── scripts/
│   └── deploy.js                  ← Deploys + seeds 15 markets
├── hardhat.config.js
├── package.json
├── .env.example                   ← Copy to .env
│
└── frontend/
    ├── app/
    │   ├── layout.js
    │   ├── page.js                ← Main page
    │   └── globals.css
    ├── components/
    │   ├── Navbar.jsx             ← Wallet connect/disconnect/switch
    │   ├── Hero.jsx               ← Landing hero
    │   ├── MarketsGrid.jsx        ← Market listing + filters
    │   ├── MarketCard.jsx         ← Individual market card
    │   ├── BettingModal.jsx       ← FHE encryption + betting UI
    │   ├── HowItWorks.jsx         ← FHE explainer section
    │   ├── PrivacyVerifier.jsx    ← On-chain privacy verification
    │   └── Footer.jsx
    ├── lib/
    │   ├── fhevm.js               ← Zama FHEVM encryption utils
    │   ├── contract.js            ← Ethers.js contract interactions
    │   └── contractABI.js         ← ABI + addresses
    ├── next.config.js
    ├── tailwind.config.js
    └── .env.local.example
```

---

## ⚡ Quick Start

### 1. Install dependencies

```bash
# Root (contracts)
npm install

# Frontend
cd frontend && npm install
```

### 2. Configure environment

```bash
# Root — for deployment
cp .env.example .env
# Fill in: PRIVATE_KEY, SEPOLIA_RPC_URL, ETHERSCAN_API_KEY

# Frontend
cp frontend/.env.local.example frontend/.env.local
# Fill in after deploying: NEXT_PUBLIC_CONTRACT_ADDRESS
```

### 3. Deploy smart contract

```bash
# Compile
npm run compile

# Deploy to Sepolia (creates 15 prediction markets automatically)
npm run deploy:sepolia
```

After deployment, copy the contract address printed in the console and paste it into `frontend/.env.local`:
```
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourDeployedAddress
```

### 4. Run frontend

```bash
cd frontend
npm run dev
# → http://localhost:3000
```

### 5. Deploy frontend to Vercel

```bash
cd frontend
npx vercel --prod
# Set environment variables in Vercel dashboard
```

---

## 🔐 How FHE Works in This Project

### Encrypting a Bet (Frontend)

```javascript
// In your browser — plaintext never leaves
const instance = await createInstance({ networkUrl: gatewayUrl });
const input = instance.createEncryptedInput(contractAddress, userAddress);
input.add64(BigInt(amountInGwei));  // euint64
input.addBool(choice);              // ebool (YES=true, NO=false)
const { handles, inputProof } = await input.encrypt();
```

### Storing Encrypted Bets (Smart Contract)

```solidity
// Contract receives ciphertexts — no plaintext
euint64 amount = TFHE.asEuint64(encryptedAmount, amountProof);
ebool choice   = TFHE.asEbool(encryptedChoice, choiceProof);

// FHE routing — no branch reveals choice
euint64 yesContrib = TFHE.select(choice, amount, TFHE.asEuint64(0));
euint64 noContrib  = TFHE.select(choice, TFHE.asEuint64(0), amount);

totalYesBets = TFHE.add(totalYesBets, yesContrib);
totalNoBets  = TFHE.add(totalNoBets, noContrib);
```

### Verifying Winners (Gateway)

```solidity
// Compare encrypted choice to outcome privately
ebool isWinner = TFHE.eq(userChoice, winningOutcomeEnc);

// Only the final boolean is decrypted via gateway
Gateway.requestDecryption(isWinner, this.claimCallback.selector, ...);
```

---

## ✅ Verifying Privacy On-Chain

After placing a bet:
1. Copy the transaction hash from MetaMask
2. Go to [sepolia.etherscan.io](https://sepolia.etherscan.io)
3. Search your tx → click **More Details** → **Input Data**
4. You'll see raw hex ciphertexts — **no readable ETH amount, no YES/NO**

This proves the encryption works: the blockchain stores only FHE ciphertexts.

---

## 🌐 Contract Architecture

| Function | Access | Description |
|---|---|---|
| `createMarket(question, category, duration)` | Owner only | Create a prediction market |
| `placeBet(marketId, encAmt, proof, encChoice, proof)` | Public | Place encrypted bet |
| `resolveMarket(marketId, outcome)` | Owner only | Set winning outcome |
| `claimReward(marketId)` | Public | Claim winnings via gateway |
| `getMarket(id)` | View | Get market details |
| `getUserBetStatus(id, addr)` | View | Check if user has bet |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| FHE | Zama FHEVM · TFHE-rs |
| Encryption SDK | fhevmjs |
| Smart Contracts | Solidity 0.8.24 + OpenZeppelin |
| Dev Framework | Hardhat |
| Frontend | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Wallet | Ethers.js v6 + MetaMask |
| Network | Sepolia Testnet |
| Hosting | Vercel |

---

## 📝 License

MIT — built for the Zama FHE Hackathon
