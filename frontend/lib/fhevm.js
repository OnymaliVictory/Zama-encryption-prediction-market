/**
 * fhevm.js
 * Mock FHE encryption — generates exact 32-byte handles and proofs
 * Safe for demos + hackathons
 */

import { ethers } from "ethers";

let useMockMode = true; // Always use mock — real FHEVM requires special server setup

// ── Helpers ─────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Returns a EXACTLY 32-byte Uint8Array
 */
function randomHandle32() {
  return ethers.randomBytes(32); // Uint8Array of exactly 32 bytes
}

/**
 * Returns a 128-byte Uint8Array for proof
 */
function randomProof128() {
  return ethers.randomBytes(128); // Uint8Array of exactly 128 bytes
}

// ── Mock Encryption ──────────────────────────────────────────────

async function mockEncrypt(amountEth, choice) {
  console.log("[FHEVM MOCK] Encrypting:", { amountEth, choice });

  await sleep(1200);

  return {
    encryptedAmount: randomHandle32(),   // Uint8Array 32 bytes → bytes32 ✅
    amountProof:     randomProof128(),   // Uint8Array 128 bytes → bytes ✅
    encryptedChoice: randomHandle32(),   // Uint8Array 32 bytes → bytes32 ✅
    choiceProof:     randomProof128(),   // Uint8Array 128 bytes → bytes ✅
  };
}

// ── Public API ───────────────────────────────────────────────────

export async function getFhevmInstance() {
  return { mock: true };
}

export async function encryptBet(
  amountEth,
  choice,
  contractAddress,
  userAddress
) {
  const amountGwei = Math.round(parseFloat(amountEth) * 1e9);

  if (!Number.isFinite(amountGwei) || amountGwei <= 0) {
    throw new Error("Invalid bet amount");
  }

  return await mockEncrypt(amountEth, choice);
}

export async function encryptBetAmount(
  amountEth,
  contractAddress,
  userAddress
) {
  await sleep(800);

  return {
    handle: randomHandle32(),
    proof:  randomProof128(),
  };
}

export async function encryptBetChoice(
  choice,
  contractAddress,
  userAddress
) {
  await sleep(800);

  return {
    handle: randomHandle32(),
    proof:  randomProof128(),
  };
}

export async function isFhevmAvailable() {
  return true;
}

export function getEncryptionDescription(amountEth, choice) {
  return {
    plaintext: {
      amount: `${amountEth} ETH`,
      choice: choice ? "YES" : "NO",
    },
    encrypted: {
      amount: ethers.hexlify(randomHandle32()) + " (FHE ciphertext)",
      choice: ethers.hexlify(randomHandle32()) + " (FHE ciphertext)",
    },
    algorithm: "TFHE-rs Mock (Torus FHE)",
    keySize:   "128-bit security",
  };
}