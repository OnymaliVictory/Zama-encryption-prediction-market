"use client";
import { useState } from "react";
import { placeBet, claimReward, getSepoliaExplorerTx } from "../lib/contract";
import toast from "react-hot-toast";
import { encryptBet } from "../lib/fhevm";

const STEPS = ["Choose", "Amount", "Encrypt", "Confirm"];

export default function BettingModal({ market, onClose, onSuccess, walletAddress }) {
  const [step, setStep]             = useState(0);
  const [choice, setChoice]         = useState(null);
  const [amount, setAmount]         = useState("0.01");
  const [loading, setLoading]       = useState(false);
  const [txHash, setTxHash]         = useState(null);
  const [encryptLog, setEncryptLog] = useState([]);
  const [isClaim]                   = useState(market?._action === "claim");
  const [encryptedData, setEncryptedData] = useState(null);

  const MIN = 0.001;
  const amountNum = parseFloat(amount);
  const validAmount = !isNaN(amountNum) && amountNum >= MIN && amountNum <= 10;

  const simulateEncryption = async () => {
    setStep(2);
    const logs = [];
    const push = (line) => { logs.push(line); setEncryptLog([...logs]); };
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

    try {
      await sleep(300);
      push({ type: "comment", text: "// Initializing FHEVM instance..." });

      const encrypted = await encryptBet(amount, choice, contractAddress, walletAddress);
      setEncryptedData(encrypted);

      await sleep(400);
      push({ type: "key", text: "Network public key loaded", value: "Zama Sepolia KMS" });
      await sleep(500);
      push({ type: "comment", text: "// Encrypting bet amount..." });
      await sleep(400);
      push({ type: "plain", text: `plaintext_amount = ${amount} ETH (${Math.round(parseFloat(amount) * 1e9)} gwei)` });
      await sleep(500);
      push({ type: "cipher", text: `euint64_ciphertext = 0x${Buffer.from(encrypted.encryptedAmount).toString("hex").slice(0, 32)}...` });
      await sleep(400);
      push({ type: "comment", text: "// Encrypting YES/NO choice..." });
      await sleep(500);
      push({ type: "plain", text: `plaintext_choice  = ${choice ? "true (YES)" : "false (NO)"}` });
      await sleep(500);
      push({ type: "cipher", text: `ebool_ciphertext  = 0x${Buffer.from(encrypted.encryptedChoice).toString("hex").slice(0, 32)}...` });
      await sleep(400);
      push({ type: "comment", text: "// Generating ZK input proofs..." });
      await sleep(700);
      push({ type: "value", text: "✓ Input proof generated (SNARK)" });
      await sleep(300);
      push({ type: "value", text: "✓ Encryption complete — plaintext never leaves browser" });
      await sleep(300);
      setStep(3);
    } catch (err) {
      push({ type: "plain", text: `❌ Encryption failed: ${err.message}` });
      toast.error("Encryption failed: " + err.message);
    }
  };

  const handlePlaceBet = async () => {
    if (!walletAddress) { toast.error("Please connect your wallet first"); return; }
    if (!encryptedData) { toast.error("Encryption not complete. Please go back and encrypt first."); return; }

    setLoading(true);
    try {
      const tx = await placeBet(market.id, amount, choice, walletAddress, encryptedData);
      setTxHash(tx.hash);
      toast.success("Bet placed! 🎉 Transaction submitted.");
      await tx.wait();
      toast.success("Confirmed on-chain! Your encrypted bet is live.");
      onSuccess?.();
    } catch (err) {
      toast.error(err.reason || err.message || "Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!walletAddress) { toast.error("Please connect your wallet first"); return; }
    setLoading(true);
    try {
      const tx = await claimReward(market.id);
      setTxHash(tx.hash);
      toast.success("Claim submitted!");
      await tx.wait();
      toast.success("Reward claimed! Check your wallet.");
      onSuccess?.();
    } catch (err) {
      toast.error(err.reason || err.message || "Claim failed");
    } finally {
      setLoading(false);
    }
  };

  if (market._action === "claim" || isClaim) {
    return (
      <ModalShell onClose={onClose} title="Claim Reward">
        <div className="p-6 text-center">
          <div className="text-5xl mb-4">🎁</div>
          <h3 className="font-display font-bold text-xl text-zinc-900 mb-2">Claim Your Winnings</h3>
          <p className="text-zinc-500 text-sm mb-6">
            The contract will privately verify your encrypted choice matches the winning outcome using FHE, then transfer your reward.
          </p>
          <div className="bg-gold-50 border border-gold-200 rounded-xl p-4 mb-6 text-left">
            <p className="text-xs text-gold-700 font-semibold mb-1">How FHE protects privacy here:</p>
            <p className="text-xs text-gold-600">
              Your choice is compared to the winning outcome entirely inside the encrypted domain. Even the contract never decrypts your individual choice — only the payout result.
            </p>
          </div>
          {txHash ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
              <p className="text-emerald-700 font-semibold text-sm mb-2">✅ Transaction submitted!</p>
              
                <a href={getSepoliaExplorerTx(txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gold-600 underline font-mono"
              >
                {txHash.slice(0, 20)}...{txHash.slice(-6)} ↗
              </a>
            </div>
          ) : (
            <button onClick={handleClaim} disabled={loading} className="btn-gold w-full py-3 text-sm font-bold rounded-xl">
              {loading ? <Spinner /> : "Claim Reward"}
            </button>
          )}
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell onClose={onClose} title="Place Encrypted Bet">

      {/* Step indicator */}
      <div className="flex items-center gap-0 px-6 pt-5 pb-4">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <div className={`
              flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold font-display
              transition-all duration-300
              ${i < step ? "bg-emerald-500 text-white" : i === step ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-400"}
            `}>
              {i < step ? "✓" : i + 1}
            </div>
            <div className={`text-xs ml-1.5 font-medium hidden sm:block ${i === step ? "text-zinc-900" : "text-zinc-400"}`}>
              {s}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px mx-2 ${i < step ? "bg-emerald-300" : "bg-zinc-200"}`} />
            )}
          </div>
        ))}
      </div>

      <div className="px-6 pb-6">

        {/* Market question */}
        <div className="bg-zinc-50 rounded-xl p-4 mb-5">
          <p className="text-xs text-zinc-400 mb-1">Predicting on:</p>
          <p className="font-display font-bold text-sm text-zinc-900 leading-snug">{market.question}</p>
        </div>

        {/* Step 0: Choose YES / NO */}
        {step === 0 && (
          <div className="animate-fade-in">
            <p className="font-display font-semibold text-zinc-700 text-sm mb-3">Your prediction:</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => setChoice(true)}
                className={`btn-yes py-5 rounded-xl font-display font-bold text-lg ${choice === true ? "active" : ""}`}
              >
                <div className="text-2xl mb-1">✅</div>YES
              </button>
              <button
                onClick={() => setChoice(false)}
                className={`btn-no py-5 rounded-xl font-display font-bold text-lg ${choice === false ? "active" : ""}`}
              >
                <div className="text-2xl mb-1">❌</div>NO
              </button>
            </div>
            <div className="bg-gold-50 border border-gold-200 rounded-xl p-3 mb-5 flex gap-2.5 items-start">
              <span className="text-lg">🔒</span>
              <p className="text-xs text-gold-700">
                <strong>FHE Privacy:</strong> Your YES/NO choice will be encrypted in your browser before being sent to the blockchain. No one can see which side you bet on.
              </p>
            </div>
            <button
              onClick={() => setStep(1)}
              disabled={choice === null}
              className="btn-gold w-full py-3 text-sm font-bold rounded-xl disabled:opacity-40"
            >
              Continue →
            </button>
          </div>
        )}

        {/* Step 1: Amount */}
        {step === 1 && (
          <div className="animate-fade-in">
            <p className="font-display font-semibold text-zinc-700 text-sm mb-3">Bet amount (ETH):</p>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {["0.005", "0.01", "0.05", "0.1"].map((v) => (
                <button
                  key={v}
                  onClick={() => setAmount(v)}
                  className={`py-2 rounded-lg text-xs font-bold font-mono border transition-all
                    ${amount === v ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400"}`}
                >
                  {v}
                </button>
              ))}
            </div>
            <div className="relative mb-4">
              <input
                type="number"
                value={amount}
                min={MIN}
                max={10}
                step="0.001"
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full px-4 py-3 pr-12 rounded-xl border font-mono text-sm focus:outline-none focus:ring-2 focus:ring-gold-400
                  ${validAmount ? "border-zinc-200" : "border-red-300 bg-red-50"}`}
                placeholder="0.01"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-mono">ETH</span>
            </div>
            {!validAmount && amount !== "" && (
              <p className="text-red-500 text-xs mb-3">Min bet: {MIN} ETH</p>
            )}
            <div className="bg-zinc-50 rounded-xl p-3 mb-5 text-xs font-mono">
              <div className="flex justify-between text-zinc-500">
                <span>Bet amount</span><span>{amount || "0"} ETH</span>
              </div>
              <div className="flex justify-between text-zinc-400 mt-1">
                <span>Platform fee (2%)</span>
                <span>{validAmount ? (amountNum * 0.02).toFixed(5) : "—"} ETH</span>
              </div>
              <div className="flex justify-between text-gold-700 font-bold mt-1.5 border-t border-zinc-200 pt-1.5">
                <span>Encrypted & sent</span><span>{amount || "0"} ETH</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStep(0)}
                className="flex-1 py-3 text-sm font-bold rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
              >
                ← Back
              </button>
              <button
                onClick={simulateEncryption}
                disabled={!validAmount}
                className="flex-[2] btn-gold py-3 text-sm font-bold rounded-xl"
              >
                Encrypt Inputs →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Encrypting */}
        {step === 2 && (
          <div className="animate-fade-in">
            <p className="font-display font-semibold text-zinc-700 text-sm mb-3">
              🔐 Encrypting in your browser...
            </p>
            <div className="terminal h-52 overflow-y-auto mb-4">
              {encryptLog.map((line, i) => (
                <div key={i} className={`mb-0.5 ${
                  line.type === "comment" ? "comment"
                  : line.type === "key"   ? "key"
                  : line.type === "value" ? "value"
                  : line.type === "cipher"? "cipher"
                  : "text-zinc-300"
                }`}>
                  {line.type === "key"
                    ? <><span className="key">{line.text}</span> <span className="value">= {line.value}</span></>
                    : line.text}
                </div>
              ))}
              {encryptLog.length === 0 && (
                <span className="animate-pulse">Initializing FHEVM...</span>
              )}
            </div>
            <p className="text-xs text-zinc-400 text-center font-mono">
              Your plaintext bet never touches the blockchain
            </p>
          </div>
        )}

        {/* Step 3: Confirm & Send */}
        {step === 3 && (
          <div className="animate-fade-in">
            {!txHash ? (
              <>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-zinc-50 rounded-xl p-4 text-center">
                    <p className="text-xs text-zinc-400 mb-1">Your choice</p>
                    <p className="font-display font-bold text-zinc-900">{choice ? "✅ YES" : "❌ NO"}</p>
                    <p className="text-[10px] text-zinc-400 mt-1 font-mono">→ ebool ciphertext</p>
                  </div>
                  <div className="bg-zinc-50 rounded-xl p-4 text-center">
                    <p className="text-xs text-zinc-400 mb-1">Your bet</p>
                    <p className="font-display font-bold text-zinc-900">{amount} ETH</p>
                    <p className="text-[10px] text-zinc-400 mt-1 font-mono">→ euint64 ciphertext</p>
                  </div>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-5 flex gap-2.5">
                  <span>✅</span>
                  <p className="text-xs text-emerald-700">
                    Inputs encrypted. The contract will receive only ciphertexts — your choice and amount are completely private.
                  </p>
                </div>
                <button
                  onClick={handlePlaceBet}
                  disabled={loading}
                  className="btn-gold w-full py-3 text-sm font-bold rounded-xl flex items-center justify-center gap-2"
                >
                  {loading ? <><Spinner /> Sending transaction...</> : "Confirm & Place Bet 🚀"}
                </button>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="text-5xl mb-4 animate-bounce-soft">🎉</div>
                <h3 className="font-display font-bold text-xl text-zinc-900 mb-2">Bet Placed!</h3>
                <p className="text-zinc-500 text-sm mb-4">
                  Your encrypted bet is on the blockchain. Nobody can see your choice.
                </p>
                <p></p>
                 <a href={getSepoliaExplorerTx(txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-mono mb-4 hover:bg-zinc-800 transition-colors"
                >
                  View on Sepolia Explorer ↗
                </a>
                <p className="text-[10px] text-zinc-400">
                  Check the tx — you'll see encrypted bytes, not "YES" or amounts!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </ModalShell>
  );
}

function ModalShell({ children, onClose, title }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-0">
          <h2 className="font-display font-bold text-lg text-zinc-900">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/>
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}