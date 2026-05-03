import { ethers } from "ethers";
import { CONTRACT_ABI, CONTRACT_ADDRESS, CHAIN_ID, NETWORK_NAME } from "./contractABI";
import { encryptBet } from "./fhevm";

export function getProvider() {
  if (typeof window === "undefined" || !window.ethereum) return null;
  return new ethers.BrowserProvider(window.ethereum);
}

export async function getSigner() {
  const provider = getProvider();
  if (!provider) throw new Error("No wallet detected. Please install MetaMask.");
  return await provider.getSigner();
}

export function getContract(signerOrProvider) {
  const address = CONTRACT_ADDRESS || process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  if (!address) throw new Error("Contract address not configured.");
  return new ethers.Contract(address, CONTRACT_ABI, signerOrProvider);
}

export async function connectWallet() {
  if (!window.ethereum) throw new Error("MetaMask not found.");
  const provider = new ethers.BrowserProvider(window.ethereum);
  const accounts = await provider.send("eth_requestAccounts", []);
  const network  = await provider.getNetwork();
  if (Number(network.chainId) !== CHAIN_ID) await switchNetwork();
  const signer = await provider.getSigner();
  return { address: accounts[0], signer, provider };
}

export async function switchNetwork() {
  const chainIdHex = "0x" + CHAIN_ID.toString(16);
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainIdHex }],
    });
  } catch (err) {
    if (err.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: chainIdHex,
          chainName: NETWORK_NAME,
          nativeCurrency: { name: "SepoliaETH", symbol: "ETH", decimals: 18 },
          rpcUrls: ["https://rpc.sepolia.org"],
          blockExplorerUrls: ["https://sepolia.etherscan.io"],
        }],
      });
    } else {
      throw err;
    }
  }
}

export async function getWalletBalance(address) {
  const provider = getProvider();
  if (!provider || !address) return "0";
  const balance = await provider.getBalance(address);
  return parseFloat(ethers.formatEther(balance)).toFixed(4);
}

export async function fetchAllMarkets() {
  try {
    const provider = getProvider() || new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/6bpeBPNEvCICTalrvCRnC");
    const contract = getContract(provider);
    const count    = await contract.marketCount();
    const markets  = [];
    for (let i = 0; i < Number(count); i++) {
      try {
        const m = await contract.getMarket(i);
        markets.push({
          id:             i,
          question:       m.question,
          category:       m.category,
          endTime:        Number(m.endTime),
          totalEthPool:   ethers.formatEther(m.totalEthPool),
          resolved:       m.resolved,
          winningOutcome: m.winningOutcome,
          exists:         m.exists,
          betCount:       Number(m.betCount),
        });
      } catch (e) {
        console.warn(`[Markets] Could not fetch market ${i}:`, e);
      }
    }
    return markets;
  } catch (err) {
    console.error("[Markets] fetchAllMarkets failed:", err);
    return [];
  }
}

export async function getUserBetStatus(marketId, userAddress) {
  try {
    const provider = getProvider();
    if (!provider || !userAddress) return null;
    const contract = getContract(provider);
    const status   = await contract.getUserBetStatus(marketId, userAddress);
    return {
      hasBet:    status.hasBet,
      claimed:   status.claimed,
      ethAmount: ethers.formatEther(status.ethAmount),
    };
  } catch {
    return null;
  }
}

// ── FIXED: accepts pre-encrypted data from BettingModal ──────────────────────
export async function placeBet(marketId, amountEth, choice, userAddress, encryptedData) {
  const signer          = await getSigner();
  const contract        = getContract(signer);
  const contractAddress = CONTRACT_ADDRESS || process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

  if (!contractAddress)  throw new Error("Contract address missing");
  if (!userAddress)      throw new Error("Wallet address missing");
  if (!encryptedData)    throw new Error("Encrypted data missing — encryption step not completed");

  // ✅ Use pre-encrypted data passed from BettingModal (real FHEVM ciphertexts)
  const encryptedAmount = ethers.hexlify(
    encryptedData.encryptedAmount.length === 32
      ? encryptedData.encryptedAmount
      : encryptedData.encryptedAmount.slice(0, 32)
  );

  const encryptedChoice = ethers.hexlify(
    encryptedData.encryptedChoice.length === 32
      ? encryptedData.encryptedChoice
      : encryptedData.encryptedChoice.slice(0, 32)
  );

  const amountProof = ethers.hexlify(encryptedData.amountProof);
  const choiceProof = ethers.hexlify(encryptedData.choiceProof);

  const value = ethers.parseEther(amountEth.toString());

  const tx = await contract.placeBet(
    BigInt(marketId),
    encryptedAmount,
    amountProof,
    encryptedChoice,
    choiceProof,
    { value }
  );

  return tx;
}

export async function claimReward(marketId) {
  const signer   = await getSigner();
  const contract = getContract(signer);
  return await contract.claimReward(BigInt(marketId));
}

export async function resolveMarket(marketId, outcome) {
  const signer   = await getSigner();
  const contract = getContract(signer);
  return await contract.resolveMarket(BigInt(marketId), outcome);
}

export function formatTimeRemaining(endTimestamp) {
  const now     = Math.floor(Date.now() / 1000);
  const seconds = endTimestamp - now;
  if (seconds <= 0) return "Ended";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h remaining`;
  if (h > 0) return `${h}h ${m}m remaining`;
  return `${m}m remaining`;
}

export function getSepoliaExplorerTx(txHash) {
  return `https://sepolia.etherscan.io/tx/${txHash}`;
}

export function shortenAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}