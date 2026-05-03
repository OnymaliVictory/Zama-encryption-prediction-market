"use client";
import { useState, useEffect } from "react";
import { formatTimeRemaining } from "../lib/contract";

const CATEGORY_CONFIG = {
  crypto:     { emoji: "₿",  label: "Crypto",      color: "bg-orange-50 text-orange-700 border-orange-200"   },
  defi:       { emoji: "🔗", label: "DeFi",        color: "bg-blue-50 text-blue-700 border-blue-200"         },
  social:     { emoji: "𝕏",  label: "Social",      color: "bg-zinc-100 text-zinc-700 border-zinc-300"        },
  nft:        { emoji: "🖼️", label: "NFT",         color: "bg-purple-50 text-purple-700 border-purple-200"   },
  ai:         { emoji: "🤖", label: "AI",          color: "bg-cyan-50 text-cyan-700 border-cyan-200"         },
  regulation: { emoji: "⚖️", label: "Regulation",  color: "bg-red-50 text-red-700 border-red-200"            },
};

export default function MarketCard({ market, userBet, onBetClick, index = 0 }) {
  const [timeStr, setTimeStr] = useState("");
  const [isExpired, setIsExpired] = useState(false);

  const cat = CATEGORY_CONFIG[market.category] || CATEGORY_CONFIG.crypto;

  useEffect(() => {
    const update = () => {
      const t = formatTimeRemaining(market.endTime);
      setTimeStr(t);
      setIsExpired(t === "Ended");
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, [market.endTime]);

  const poolNum = parseFloat(market.totalEthPool || "0");
  const canBet  = !market.resolved && !isExpired && !userBet?.hasBet;

  // Simulated YES/NO split for display (actual totals are encrypted)
  // This shows mock proportions — in production you'd use events or a graph
  const mockYesPct = 50 + ((market.id * 7 + 13) % 40) - 20; // deterministic pseudo-random
  const yesPct = Math.min(Math.max(mockYesPct, 5), 95);
  const noPct  = 100 - yesPct;

  return (
    <div
      className={`
        bg-white rounded-2xl border border-zinc-200 shadow-card card-lift
        overflow-hidden flex flex-col
        animate-fade-in-up stagger-${Math.min(index + 1, 6)}
      `}
    >
      {/* Top strip */}
      <div className="h-1 w-full bg-gold-gradient" />

      <div className="p-5 flex flex-col flex-1">

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`badge border ${cat.color}`}>
              {cat.emoji} {cat.label}
            </span>
            {market.resolved ? (
              <span className="badge bg-zinc-100 border border-zinc-300 text-zinc-600">
                ✓ Resolved
              </span>
            ) : isExpired ? (
              <span className="badge bg-amber-50 border border-amber-200 text-amber-700">
                ⏳ Ended
              </span>
            ) : (
              <span className="badge bg-emerald-50 border border-emerald-200 text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            )}
            {/* Privacy badge */}
            <span className="badge bg-gold-50 border border-gold-200 text-gold-700">
              🔒 Private
            </span>
          </div>
        </div>

        {/* Question */}
        <p className="font-display font-bold text-zinc-900 text-base leading-snug mb-4 flex-1">
          {market.question}
        </p>

        {/* Resolved outcome */}
        {market.resolved && (
          <div className={`
            mb-4 px-4 py-3 rounded-xl flex items-center gap-3
            ${market.winningOutcome
              ? "bg-emerald-50 border border-emerald-200"
              : "bg-red-50 border border-red-200"
            }
          `}>
            <span className="text-2xl">{market.winningOutcome ? "✅" : "❌"}</span>
            <div>
              <p className="text-xs text-zinc-500">Outcome</p>
              <p className={`font-display font-bold text-sm ${market.winningOutcome ? "text-emerald-700" : "text-red-700"}`}>
                {market.winningOutcome ? "YES — happened!" : "NO — didn't happen"}
              </p>
            </div>
          </div>
        )}

        {/* Encrypted pools bar (decorative — shows privacy aspect) */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-zinc-400 mb-1.5 font-mono">
            <span>YES pool</span>
            <span>encrypted 🔐</span>
            <span>NO pool</span>
          </div>
          <div className="flex rounded-full overflow-hidden h-2 bg-zinc-100">
            <div
              className="bg-emerald-400 transition-all duration-700"
              style={{ width: `${yesPct}%` }}
            />
            <div
              className="bg-rose-400 transition-all duration-700"
              style={{ width: `${noPct}%` }}
            />
          </div>
          <p className="text-[10px] text-zinc-400 mt-1 text-center font-mono">
            ← Individual bets hidden by FHE →
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-zinc-50 rounded-xl p-3 text-center">
            <p className="font-mono font-bold text-zinc-900 text-sm">
              {poolNum > 0 ? `${poolNum.toFixed(3)}` : "—"}
            </p>
            <p className="text-[10px] text-zinc-400 mt-0.5">Total ETH</p>
          </div>
          <div className="bg-zinc-50 rounded-xl p-3 text-center">
            <p className="font-mono font-bold text-zinc-900 text-sm">
              {market.betCount}
            </p>
            <p className="text-[10px] text-zinc-400 mt-0.5">Bettors</p>
          </div>
          <div className="bg-zinc-50 rounded-xl p-3 text-center">
            <p className="font-mono font-bold text-zinc-900 text-sm truncate text-xs">
              {timeStr || "..."}
            </p>
            <p className="text-[10px] text-zinc-400 mt-0.5">Time</p>
          </div>
        </div>

        {/* User bet status */}
        {userBet?.hasBet && (
          <div className="mb-3 px-3 py-2.5 rounded-xl bg-gold-50 border border-gold-200 flex items-center gap-2">
            <span className="text-base">🔒</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gold-800">
                Your bet: {parseFloat(userBet.ethAmount).toFixed(4)} ETH
              </p>
              <p className="text-[10px] text-gold-600">Choice encrypted — private until resolved</p>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-auto">
          {canBet && (
            <button
              onClick={() => onBetClick(market)}
              className="btn-gold w-full py-3 text-sm font-bold rounded-xl"
            >
              Place Encrypted Bet
            </button>
          )}

          {market.resolved && userBet?.hasBet && !userBet?.claimed && (
            <button
              onClick={() => onBetClick(market, "claim")}
              className="w-full py-3 text-sm font-bold rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 transition-colors"
            >
              Claim Reward 🎉
            </button>
          )}

          {market.resolved && userBet?.claimed && (
            <div className="w-full py-3 text-sm text-center text-zinc-400 font-mono">
              ✓ Reward claimed
            </div>
          )}

          {!canBet && !market.resolved && !userBet?.hasBet && (
            <div className="w-full py-3 text-sm text-center text-zinc-400 font-mono">
              {isExpired ? "Betting closed" : "Already bet"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
