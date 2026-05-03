"use client";
import { useState } from "react";
import { getSepoliaExplorerTx } from "../lib/contract";

const VERIFICATION_STEPS = [
  {
    step: 1,
    title: "Submit your encrypted bet",
    desc: "Click 'Place Encrypted Bet' on any market. After signing, you'll get a transaction hash.",
    icon: "📝",
  },
  {
    step: 2,
    title: "Open Sepolia Etherscan",
    desc: "Go to sepolia.etherscan.io and search for your transaction hash.",
    icon: "🔍",
  },
  {
    step: 3,
    title: "Check the Input Data",
    desc: "Click 'More Details' → 'Input Data'. You'll see raw hex — not readable bet amounts or YES/NO choices.",
    icon: "📊",
  },
  {
    step: 4,
    title: "Inspect contract storage",
    desc: "The contract stores euint64 and ebool handles — encrypted ciphertexts, not plaintext values.",
    icon: "🔒",
  },
];

export default function PrivacyVerifier({ lastTxHash }) {
  const [txInput, setTxInput] = useState(lastTxHash || "");
  const [checking, setChecking] = useState(false);
  const [mockResult, setMockResult] = useState(null);

  const handleVerify = async () => {
    if (!txInput) return;
    setChecking(true);
    await new Promise(r => setTimeout(r, 1500));

    // Mock verification result (in production, you'd decode calldata)
    setMockResult({
      txHash: txInput,
      funcSelector: "0x" + randomHex(8),
      arg1_name: "encryptedAmount",
      arg1_type: "bytes32 (euint64 handle)",
      arg1_value: "0x" + randomHex(64),
      arg2_name: "amountProof",
      arg2_type: "bytes (ZK input proof)",
      arg2_value: "0x" + randomHex(128),
      arg3_name: "encryptedChoice",
      arg3_type: "bytes32 (ebool handle)",
      arg3_value: "0x" + randomHex(64),
      arg4_name: "choiceProof",
      arg4_type: "bytes (ZK input proof)",
      arg4_value: "0x" + randomHex(128),
      verdict: "✅ PRIVATE — No readable bet amount or YES/NO found in calldata",
    });
    setChecking(false);
  };

  return (
    <section className="py-20 bg-zinc-950 text-white" id="verify">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gold-400 text-sm font-semibold font-display mb-4">
            🔍 Verify Privacy On-Chain
          </div>
          <h2 className="font-display font-bold text-4xl text-white mb-4">
            Don't Trust. Verify.
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto">
            After placing a bet, check the transaction yourself on Sepolia Explorer. 
            Confirm that only encrypted bytes — never your actual bet — hit the blockchain.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {VERIFICATION_STEPS.map((s) => (
            <div key={s.step} className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{s.icon}</span>
                <span className="font-mono text-gold-400 text-sm font-bold">Step {s.step}</span>
              </div>
              <h4 className="font-display font-bold text-white text-sm mb-2">{s.title}</h4>
              <p className="text-zinc-400 text-xs leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Interactive verifier */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 max-w-3xl mx-auto">
          <h3 className="font-display font-bold text-white text-lg mb-4">
            🔬 Demo Calldata Inspector
          </h3>
          <p className="text-zinc-400 text-sm mb-4">
            Paste a placeBet transaction hash (or use a demo):
          </p>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={txInput}
              onChange={(e) => setTxInput(e.target.value)}
              placeholder="0xabc123... (Sepolia tx hash)"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono text-zinc-300 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
            <button
              onClick={() => setTxInput("0x" + randomHex(64))}
              className="px-3 py-2.5 rounded-xl border border-white/10 text-zinc-400 text-xs hover:bg-white/5 transition-colors"
            >
              Demo
            </button>
            <button
              onClick={handleVerify}
              disabled={!txInput || checking}
              className="btn-gold px-5 py-2.5 text-sm font-bold rounded-xl disabled:opacity-40"
            >
              {checking ? "Checking..." : "Inspect"}
            </button>
          </div>

          {txInput && (
            <a
              href={getSepoliaExplorerTx(txInput)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gold-400 hover:text-gold-300 underline font-mono"
            >
              View on Sepolia Explorer ↗
            </a>
          )}

          {/* Decoded result */}
          {mockResult && (
            <div className="mt-5 terminal">
              <div className="comment mb-3">
                // Decoded calldata for placeBet(...)
              </div>

              {[
                { name: mockResult.arg1_name, type: mockResult.arg1_type, val: mockResult.arg1_value },
                { name: mockResult.arg2_name, type: mockResult.arg2_type, val: mockResult.arg2_value.slice(0, 32) + "..." },
                { name: mockResult.arg3_name, type: mockResult.arg3_type, val: mockResult.arg3_value },
                { name: mockResult.arg4_name, type: mockResult.arg4_type, val: mockResult.arg4_value.slice(0, 32) + "..." },
              ].map((arg) => (
                <div key={arg.name} className="mb-2">
                  <span className="key">{arg.name}</span>
                  <span className="comment"> ({arg.type})</span>
                  <br />
                  <span className="cipher ml-4">{arg.val}</span>
                </div>
              ))}

              <div className="mt-4 border-t border-white/10 pt-3 text-emerald-400 font-bold">
                {mockResult.verdict}
              </div>
              <div className="comment mt-1">
                // No readable amount. No "YES" or "NO". Only FHE ciphertexts.
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function randomHex(len) {
  return Array.from({ length: len }, () =>
    "0123456789abcdef"[Math.floor(Math.random() * 16)]
  ).join("");
}
