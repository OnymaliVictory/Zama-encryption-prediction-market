"use client";
import { useState, useEffect } from "react";

const TICKER_ITEMS = [
  "BTC > $100K?", "ETH flips BTC?", "Elon tweets 25x?",
  "DOGE to $0.50?", "Fed rate cut?", "New CEX listing?",
  "DeFi TVL $200B?", "Solana outage?", "NFT $1M sale?",
  "AI token top 20?", "Gas < 5 gwei?", "SEC crypto ETF?",
];

const STATS = [
  { label: "Markets Live",    value: "15",     suffix: "" },
  { label: "Privacy Level",   value: "128",    suffix: "-bit" },
  { label: "FHE Operations",  value: "TFHE",   suffix: "" },
  { label: "Chain",           value: "Sepolia", suffix: "" },
];

export default function Hero({ onExploreClick }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCount(c => c + 1), 80);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative overflow-hidden bg-white">

      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: "radial-gradient(circle, #18181B 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Gold blob */}
      <div className="absolute top-0 right-0 w-[600px] h-[500px] opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at top right, #FBBF24, transparent 70%)" }}
      />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] opacity-8 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at bottom left, #FCD34D, transparent 70%)" }}
      />

      {/* Ticker bar */}
      <div className="bg-zinc-950 text-gold-400 py-2 relative overflow-hidden ticker-bar">
        <div className="flex animate-ticker-scroll whitespace-nowrap">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="mx-6 text-xs font-mono font-medium">
              🔒 {item}
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 relative">
        <div className="max-w-4xl mx-auto text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-950 text-gold-400 text-sm font-semibold font-display mb-8 animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
            Fully Homomorphic Encryption · Live on Sepolia
          </div>

          {/* Headline */}
          <h1 className="text-hero font-display font-extrabold text-zinc-900 tracking-tight mb-6 animate-fade-in-up stagger-1"
            style={{ fontSize: "clamp(2.8rem, 7vw, 5rem)", lineHeight: 1.1 }}>
            Bet on the Future.
            <br />
            <span className="text-gold-gradient">Your Choice Stays Private.</span>
          </h1>

          {/* Sub */}
          <p className="text-zinc-500 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up stagger-2">
            The world's first prediction market where bet amounts and YES/NO choices
            are <strong className="text-zinc-700">encrypted on-chain</strong> using Zama's FHEVM.
            No plaintext. No leaks. Just math on encrypted data.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-14 animate-fade-in-up stagger-3">
            <button
              onClick={onExploreClick}
              className="btn-gold px-8 py-4 text-base font-bold rounded-xl shadow-gold-lg"
            >
              Explore Markets →
            </button>
            <a
              href="#how-it-works"
              className="px-8 py-4 text-base font-bold rounded-xl border-2 border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition-all"
            >
              How FHE Works
            </a>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto animate-fade-in-up stagger-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4">
                <p className="font-display font-extrabold text-xl text-zinc-900 font-mono">
                  {stat.value}<span className="text-gold-500">{stat.suffix}</span>
                </p>
                <p className="text-xs text-zinc-400 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* FHE pill */}
          <div className="mt-10 animate-fade-in-up stagger-5">
            <div className="inline-flex items-center gap-4 px-6 py-3 rounded-full bg-zinc-950 text-xs font-mono text-zinc-400 border border-zinc-800">
              <span>plaintext_bet</span>
              <span className="text-zinc-600">→</span>
              <span className="text-gold-400">TFHE.encrypt()</span>
              <span className="text-zinc-600">→</span>
              <span className="text-emerald-400">0x{Array.from({ length: 16 }, (_, i) =>
                "0123456789abcdef"[(count + i * 3) % 16]).join("")}...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
