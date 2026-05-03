"use client";

export default function Footer() {
  return (
    <footer className="bg-zinc-950 text-zinc-400 py-12 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gold-gradient flex items-center justify-center">
                <span className="text-zinc-900 font-bold font-display text-sm">Z</span>
              </div>
              <span className="font-display font-bold text-white text-lg">ZeroKnow</span>
            </div>
            <p className="text-sm leading-relaxed">
              Private prediction markets powered by Fully Homomorphic Encryption. 
              Bet on the future — your choices stay yours.
            </p>
          </div>

          {/* Tech stack */}
          <div>
            <h4 className="font-display font-bold text-white text-sm mb-3">Tech Stack</h4>
            <ul className="space-y-1.5 text-sm">
              {[
                { name: "Zama FHEVM", href: "https://docs.zama.ai/fhevm" },
                { name: "TFHE-rs (Torus FHE)", href: "https://github.com/zama-ai/tfhe-rs" },
                { name: "fhevmjs SDK", href: "https://github.com/zama-ai/fhevmjs" },
                { name: "Next.js 14 + Tailwind", href: "https://nextjs.org" },
                { name: "Ethers.js v6", href: "https://docs.ethers.org" },
                { name: "Deployed on Sepolia", href: "https://sepolia.etherscan.io" },
              ].map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gold-400 transition-colors"
                  >
                    → {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Hackathon */}
          <div>
            <h4 className="font-display font-bold text-white text-sm mb-3">Built For</h4>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-gold-400 font-bold font-display text-sm mb-1">
                🏆 Zama FHE Hackathon
              </p>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Category: Privacy-preserving DeFi / Prediction Markets
              </p>
              <div className="mt-3 pt-3 border-t border-white/10 text-xs">
                <p className="text-zinc-400 mb-1">Key innovations:</p>
                <ul className="space-y-1 text-zinc-500">
                  <li>• On-chain FHE-encrypted bets</li>
                  <li>• ebool + euint64 in single tx</li>
                  <li>• TFHE.select for private routing</li>
                  <li>• Gateway decrypt for payout</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs font-mono">
            ZeroKnow © 2025 · Built on Zama FHEVM · Sepolia Testnet
          </p>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Sepolia Live
            </span>
            <span className="text-zinc-600">|</span>
            <span>128-bit FHE security</span>
            <span className="text-zinc-600">|</span>
            <span>Open source</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
