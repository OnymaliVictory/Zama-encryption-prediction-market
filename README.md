# 🔐 ZeroKnow — Private Prediction Market

> Bet on the future. Your choices stay encrypted.

Built with **Zama FHEVM** — the world's first prediction market where bet amounts and YES/NO choices are fully encrypted on-chain using Fully Homomorphic Encryption.

## 🌐 Live Demo
[https://your-vercel-url.vercel.app](https://your-vercel-url.vercel.app)

## 🏆 Hackathon
Built for the **Zama FHE Hackathon** — Category: Privacy-preserving DeFi

## 🔒 How Privacy Works
- User selects YES/NO and enters bet amount
- Both values are encrypted in the browser using `fhevmjs`
- Only FHE ciphertexts (`bytes32`) are sent to the smart contract
- No plaintext bet data ever touches the blockchain
- Check any transaction on Sepolia Explorer — you'll see only encrypted bytes

## 🛠 Tech Stack
| Layer | Technology |
|---|---|
| FHE | Zama FHEVM |
| Smart Contracts | Solidity 0.8.24 + OpenZeppelin |
| Frontend | Next.js 14 + Tailwind CSS |
| Wallet | Ethers.js v6 + MetaMask |
| Data | Polymarket API (live markets) |
| Network | Sepolia Testnet |
| Hosting | Vercel |

## ⚡ Quick Start

```bash
# Install contract dependencies
npm install

# Deploy to Sepolia
npm run deploy:sepolia

# Run frontend
cd frontend
npm install
npm run dev
```

## 📄 Contract
- **Network:** Sepolia Testnet
- **Address:** `0x2e126c083C47a4Fd547eD4d7E435f989D823BAE1`
- **Explorer:** [View on Etherscan](https://sepolia.etherscan.io/address/0x2e126c083C47a4Fd547eD4d7E435f989D823BAE1)

## 🔑 Key FHE Operations
```solidity
TFHE.add(a, b)           // Add encrypted integers
TFHE.select(cond, a, b)  // Encrypted if-else
TFHE.eq(a, b)            // Compare encrypted values
```

## License
MIT
