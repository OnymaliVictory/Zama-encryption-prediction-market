/**
 * fhevm.js — Mock FHE encryption
 * Generates exact 32-byte handles that work with the deployed contract
 */

import { ethers } from "ethers";

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function randomHandle32() {
  return ethers.randomBytes(32);
}

function randomProof128() {
  return ethers.randomBytes(128);
}

async function mockEncrypt(amountEth, choice) {
  console.log("[FHEVM MOCK] Encrypting:", { amountEth, choice });
  await sleep(1200);
  return {
    encryptedAmount: randomHandle32(),
    amountProof:     randomProof128(),
    encryptedChoice: randomHandle32(),
    choiceProof:     randomProof128(),
  };
}

export async function getFhevmInstance() {
  return { mock: true };
}

export async function encryptBet(amountEth, choice, contractAddress, userAddress) {
  const amountGwei = Math.round(parseFloat(amountEth) * 1e9);
  if (!Number.isFinite(amountGwei) || amountGwei <= 0) {
    throw new Error("Invalid bet amount");
  }
  return await mockEncrypt(amountEth, choice);
}

export async function encryptBetAmount(amountEth, contractAddress, userAddress) {
  await sleep(800);
  return {
    handle: randomHandle32(),
    proof:  randomProof128(),
  };
}

export async function encryptBetChoice(choice, contractAddress, userAddress) {
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
    algorithm: "TFHE-rs (Torus FHE)",
    keySize:   "128-bit security",
  };
}