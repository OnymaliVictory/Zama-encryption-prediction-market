"use client";

const STEPS = [
  {
    number: "01",
    icon: "🔗",
    title: "Connect Wallet",
    desc: "Connect MetaMask to Sepolia testnet. Your wallet signs transactions — your private key never leaves your browser.",
    color: "from-blue-50 to-blue-100/50",
    border: "border-blue-200",
  },
  {
    number: "02",
    icon: "🧠",
    title: "Choose & Bet",
    desc: "Select YES or NO on any prediction market and input your ETH amount. The real magic happens before it hits the chain.",
    color: "from-purple-50 to-purple-100/50",
    border: "border-purple-200",
  },
  {
    number: "03",
    icon: "🔒",
    title: "FHE Encryption",
    desc: "Using Zama's TFHE-rs library, your bet amount becomes an euint64 ciphertext and your choice becomes an ebool ciphertext — all in your browser.",
    color: "from-gold-50 to-gold-100/50",
    border: "border-gold-200",
    highlight: true,
  },
  {
    number: "04",
    icon: "⛓️",
    title: "On-Chain Privacy",
    desc: "Only encrypted bytes are sent to the smart contract. Blockchain explorers show unreadable ciphertexts — not your bet amount or YES/NO.",
    color: "from-zinc-50 to-zinc-100/50",
    border: "border-zinc-200",
  },
  {
    number: "05",
    icon: "🧮",
    title: "FHE Computation",
    desc: "The contract computes totals and compares your choice to outcomes using TFHE operations — math on encrypted data, never decrypting intermediate values.",
    color: "from-emerald-50 to-emerald-100/50",
    border: "border-emerald-200",
  },
  {
    number: "06",
    icon: "🎁",
    title: "Claim Reward",
    desc: "After resolution, claim your reward. The gateway decrypts only the final isWinner boolean — your bet size and original choice stay private forever.",
    color: "from-orange-50 to-orange-100/50",
    border: "border-orange-200",
  },
];

const PRIVACY_COMPARISONS = [
  {
    label: "Traditional prediction market",
    icon: "😰",
    items: [
      { text: "Bet amount visible on-chain", bad: true },
      { text: "YES/NO choice visible to all", bad: true },
      { text: "Wallet address linked to bet", bad: true },
      { text: "Competitors can see your position", bad: true },
    ],
  },
  {
    label: "ZeroKnow with FHE",
    icon: "🔒",
    items: [
      { text: "Bet amount encrypted (euint64)", bad: false },
      { text: "Choice encrypted (ebool)", bad: false },
      { text: "On-chain: only ciphertexts stored", bad: false },
      { text: "Outcomes computed in encrypted domain", bad: false },
    ],
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-white border-t border-zinc-100" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-50 border border-gold-200 text-gold-700 text-sm font-semibold font-display mb-4">
            🧬 Powered by Zama FHEVM
          </div>
          <h2 className="font-display font-bold text-4xl sm:text-5xl text-zinc-900 mb-4">
            How the Privacy Works
          </h2>
          <p className="text-zinc-500 text-lg max-w-2xl mx-auto">
            Fully Homomorphic Encryption lets the smart contract compute on your encrypted data
            without ever decrypting it. It's like doing math on a locked safe.
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {STEPS.map((step, i) => (
            <div
              key={step.number}
              className={`
                relative p-6 rounded-2xl border bg-gradient-to-br ${step.color} ${step.border}
                animate-fade-in-up
                ${step.highlight ? "ring-2 ring-gold-400 ring-offset-2" : ""}
              `}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              {step.highlight && (
                <div className="absolute -top-3 left-6">
                  <span className="badge bg-gold-500 text-white border-0 text-[10px] shadow-gold">
                    ⭐ Core FHE Layer
                  </span>
                </div>
              )}
              <div className="flex items-start gap-4">
                <div className="text-3xl">{step.icon}</div>
                <div>
                  <div className="font-mono text-xs text-zinc-400 mb-1">{step.number}</div>
                  <h3 className="font-display font-bold text-zinc-900 text-base mb-2">
                    {step.title}
                  </h3>
                  <p className="text-zinc-600 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Privacy comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {PRIVACY_COMPARISONS.map((col) => (
            <div
              key={col.label}
              className={`p-6 rounded-2xl border ${
                col.icon === "🔒"
                  ? "bg-zinc-900 border-zinc-700 text-white"
                  : "bg-zinc-50 border-zinc-200"
              }`}
            >
              <p className={`font-display font-bold text-base mb-4 flex items-center gap-2 ${
                col.icon === "🔒" ? "text-white" : "text-zinc-700"
              }`}>
                <span>{col.icon}</span> {col.label}
              </p>
              <ul className="space-y-2.5">
                {col.items.map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm">
                    <span className={item.bad ? "text-red-500" : "text-gold-400"}>
                      {item.bad ? "✗" : "✓"}
                    </span>
                    <span className={col.icon === "🔒" ? "text-zinc-300" : "text-zinc-600"}>
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* FHE explainer box */}
        <div className="bg-zinc-950 rounded-2xl p-8 text-white overflow-hidden relative">
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: "radial-gradient(circle, #FBBF24 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

          <div className="relative">
            <h3 className="font-display font-bold text-2xl mb-2">
              What is <span className="text-gold-gradient">TFHE</span>?
            </h3>
            <p className="text-zinc-400 mb-6 max-w-2xl">
              Torus Fully Homomorphic Encryption — developed by Zama — allows computation directly on encrypted integers and booleans without needing to decrypt first.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {[
                { op: "TFHE.add(a, b)", desc: "Add two encrypted integers", result: "euint64" },
                { op: "TFHE.select(cond, a, b)", desc: "Encrypted if-else branch", result: "euint64" },
                { op: "TFHE.eq(a, b)", desc: "Compare encrypted values", result: "ebool" },
              ].map((item) => (
                <div key={item.op} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <code className="text-gold-400 text-xs font-mono block mb-1">{item.op}</code>
                  <p className="text-zinc-400 text-xs mb-2">{item.desc}</p>
                  <span className="badge bg-zinc-800 text-zinc-300 border-zinc-700 text-[10px]">
                    → {item.result}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-zinc-500 text-xs font-mono">
              Built with Zama's fhevmjs SDK · TFHE-rs backend · Sepolia testnet · 128-bit security level
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
