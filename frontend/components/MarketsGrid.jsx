"use client";
import { useState, useEffect, useCallback } from "react";
import MarketCard from "./MarketCard";
import BettingModal from "./BettingModal";
import { fetchAllMarkets, getUserBetStatus } from "../lib/contract";
import toast from "react-hot-toast";

const CATEGORIES = ["all", "crypto", "defi", "social", "nft", "ai", "regulation"];

const MOCK_MARKETS = [
  { id: 0, question: "Will Bitcoin exceed $100,000 before the end of this month?", category: "crypto", endTime: Math.floor(Date.now()/1000) + 86400*25, totalEthPool: "0.45", resolved: false, winningOutcome: false, exists: true, betCount: 12 },
  { id: 1, question: "Will Elon Musk post more than 25 tweets in a single day this week?", category: "social", endTime: Math.floor(Date.now()/1000) + 86400*5, totalEthPool: "0.12", resolved: false, winningOutcome: false, exists: true, betCount: 8 },
  { id: 2, question: "Will Ethereum gas fees drop below 5 gwei this week?", category: "defi", endTime: Math.floor(Date.now()/1000) + 86400*4, totalEthPool: "0.33", resolved: false, winningOutcome: false, exists: true, betCount: 15 },
  { id: 3, question: "Will a major CEX announce a new meme coin listing this week?", category: "crypto", endTime: Math.floor(Date.now()/1000) + 86400*6, totalEthPool: "0.07", resolved: false, winningOutcome: false, exists: true, betCount: 5 },
  { id: 4, question: "Will the total DeFi TVL exceed $200 billion this month?", category: "defi", endTime: Math.floor(Date.now()/1000) + 86400*22, totalEthPool: "0.89", resolved: false, winningOutcome: false, exists: true, betCount: 31 },
  { id: 5, question: "Will $DOGE reach $0.50 before the next Bitcoin halving?", category: "crypto", endTime: Math.floor(Date.now()/1000) + 86400*28, totalEthPool: "0.21", resolved: false, winningOutcome: false, exists: true, betCount: 9 },
  { id: 6, question: "Will a new AI agent token enter the top 20 on CoinMarketCap this month?", category: "ai", endTime: Math.floor(Date.now()/1000) + 86400*18, totalEthPool: "0.66", resolved: false, winningOutcome: false, exists: true, betCount: 24 },
  { id: 7, question: "Will Ethereum flip Bitcoin in market cap by end of Q2 2025?", category: "crypto", endTime: Math.floor(Date.now()/1000) + 86400*30, totalEthPool: "1.20", resolved: false, winningOutcome: false, exists: true, betCount: 44 },
  { id: 8, question: "Will Base chain surpass Arbitrum in daily transactions this week?", category: "defi", endTime: Math.floor(Date.now()/1000) + 86400*3, totalEthPool: "0.15", resolved: false, winningOutcome: false, exists: true, betCount: 7 },
  { id: 9, question: "Will any NFT collection sell for over $1M this week?", category: "nft", endTime: Math.floor(Date.now()/1000) + 86400*4, totalEthPool: "0.08", resolved: false, winningOutcome: false, exists: true, betCount: 3 },
  { id: 10, question: "Will the SEC approve a new spot crypto ETF this month?", category: "regulation", endTime: Math.floor(Date.now()/1000) + 86400*20, totalEthPool: "2.10", resolved: false, winningOutcome: false, exists: true, betCount: 67 },
  { id: 11, question: "Will Solana suffer a network outage this week?", category: "crypto", endTime: Math.floor(Date.now()/1000) + 86400*5, totalEthPool: "0.18", resolved: false, winningOutcome: false, exists: true, betCount: 11 },
  { id: 12, question: "Will Vitalik Buterin tweet about Layer 3s this week?", category: "social", endTime: Math.floor(Date.now()/1000) + 86400*6, totalEthPool: "0.05", resolved: false, winningOutcome: false, exists: true, betCount: 4 },
  { id: 13, question: "Will a stablecoin lose its peg (>5% deviation) this week?", category: "defi", endTime: Math.floor(Date.now()/1000) + 86400*2, totalEthPool: "0.41", resolved: false, winningOutcome: false, exists: true, betCount: 19 },
  { id: 14, question: "Will the Bitcoin Fear & Greed Index hit 'Extreme Greed' (>80) this week?", category: "crypto", endTime: Math.floor(Date.now()/1000) + 86400*5, totalEthPool: "0.95", resolved: false, winningOutcome: false, exists: true, betCount: 38 },
];

function guessCategory(tags = [], question = "") {
  const combined = (question + " " + tags.map(t => t?.label || t || "").join(" ")).toLowerCase();
  if (combined.match(/nft|opensea|blur/)) return "nft";
  if (combined.match(/defi|tvl|yield|liquidity|uniswap|aave/)) return "defi";
  if (combined.match(/bitcoin|btc|ethereum|eth|solana|crypto|coin|token|blockchain/)) return "crypto";
  if (combined.match(/ai|artificial|openai|gpt|model|llm|agent/)) return "ai";
  if (combined.match(/sec|regulation|law|congress|ban|approve|legal/)) return "regulation";
  if (combined.match(/tweet|elon|musk|social|post|follower/)) return "social";
  return "crypto";
}

function polymarketToMarket(pm, index) {
  const volumeUSDC = parseFloat(pm.volume || pm.volumeNum || 0);
  const ethPool    = (volumeUSDC / 2000).toFixed(3);
  const endTime    = pm.endDate
    ? Math.floor(new Date(pm.endDate).getTime() / 1000)
    : Math.floor(Date.now() / 1000) + 86400 * 7;
  return {
    id:             `poly-${index}`,
    question:       pm.question || pm.title || "Unknown market",
    category:       guessCategory(pm.tags, pm.question || ""),
    endTime,
    totalEthPool:   ethPool,
    resolved:       pm.closed || pm.resolved || false,
    winningOutcome: false,
    exists:         true,
    betCount:       pm.tradesCount || pm.numTrades || Math.floor(volumeUSDC / 50) || 0,
    polyUrl:        pm.slug ? `https://polymarket.com/event/${pm.slug}` : null,
    isPolymarket:   true,
  };
}

// Fetch via our own Next.js API route to avoid CORS
async function fetchPolymarkets() {
  const res = await fetch("/api/polymarkets");
  if (!res.ok) throw new Error("Polymarket proxy error");
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error("Invalid response");
  return data
    .filter(m => m.question && !m.closed && m.active !== false)
    .slice(0, 20)
    .map((m, i) => polymarketToMarket(m, i));
}

export default function MarketsGrid({ walletAddress, sectionRef }) {
  const [markets, setMarkets]               = useState([]);
  const [userBets, setUserBets]             = useState({});
  const [loading, setLoading]               = useState(true);
  const [activeFilter, setActiveFilter]     = useState("all");
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [searchQuery, setSearchQuery]       = useState("");
  const [contractConnected, setContractConnected] = useState(false);
  const [polymarketLive, setPolymarketLive] = useState(false);
  const [lastRefreshed, setLastRefreshed]   = useState(null);
  const [refreshing, setRefreshing]         = useState(false);

  const loadMarkets = useCallback(async () => {
    setLoading(true);
    let finalMarkets = [];

    try {
      const liveMarkets = await fetchAllMarkets();
      if (liveMarkets.length > 0) {
        finalMarkets = liveMarkets;
        setContractConnected(true);
      }
    } catch {}

    try {
      const polyMarkets = await fetchPolymarkets();
      if (polyMarkets.length > 0) {
        finalMarkets = [...finalMarkets, ...polyMarkets];
        setPolymarketLive(true);
        setLastRefreshed(new Date());
      }
    } catch {
      // silently fall back — no error toast on initial load
      setPolymarketLive(false);
    }

    if (finalMarkets.length === 0) finalMarkets = MOCK_MARKETS;

    setMarkets(finalMarkets);
    setLoading(false);
  }, []);

  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      const polyMarkets = await fetchPolymarkets();
      if (polyMarkets.length > 0) {
        setMarkets(prev => [
          ...prev.filter(m => !m.isPolymarket),
          ...polyMarkets,
        ]);
        setPolymarketLive(true);
        setLastRefreshed(new Date());
        toast.success("Markets refreshed!");
      } else {
        // No data but no error — just silently skip
      }
    } catch {
      // Silently fail — Polymarket CORS blocks direct requests in dev
      // On Vercel this will work via the API route
    } finally {
      setRefreshing(false);
    }
  }, [refreshing]);

  const loadUserBets = useCallback(async () => {
    if (!walletAddress || markets.length === 0) return;
    const bets = {};
    for (const m of markets) {
      if (m.isPolymarket) continue;
      try {
        const status = await getUserBetStatus(m.id, walletAddress);
        if (status) bets[m.id] = status;
      } catch {}
    }
    setUserBets(bets);
  }, [walletAddress, markets]);

  useEffect(() => { loadMarkets(); }, [loadMarkets]);
  useEffect(() => { loadUserBets(); }, [loadUserBets]);

  // Auto-refresh every 2 minutes silently
  useEffect(() => {
    const interval = setInterval(handleRefresh, 120000);
    return () => clearInterval(interval);
  }, [handleRefresh]);

  const openBetModal = (market, action = "bet") => {
    if (!walletAddress) { toast.error("Connect your wallet first!"); return; }
    setSelectedMarket({ ...market, _action: action });
  };

  const handleBetSuccess = () => {
    setSelectedMarket(null);
    setTimeout(() => { loadMarkets(); loadUserBets(); }, 3000);
  };

  const filtered = markets.filter(m => {
    const catOk    = activeFilter === "all" || m.category === activeFilter;
    const searchOk = !searchQuery || m.question.toLowerCase().includes(searchQuery.toLowerCase());
    return catOk && searchOk && m.exists;
  });

  const polyCount     = markets.filter(m => m.isPolymarket).length;
  const contractCount = markets.filter(m => !m.isPolymarket).length;

  return (
    <section ref={sectionRef} className="py-16 bg-zinc-50" id="markets">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-zinc-900 mb-1">Live Markets</h2>
            <p className="text-zinc-400 text-sm">
              {polymarketLive
                ? `${polyCount} live from Polymarket · ${contractCount} on-chain`
                : contractConnected
                  ? `${markets.length} markets live on Sepolia`
                  : `${markets.length} demo markets`}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {polymarketLive && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border bg-blue-50 border-blue-200 text-blue-700">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                Live · Polymarket
              </div>
            )}
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${contractConnected ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-amber-50 border-amber-200 text-amber-700"}`}>
              <span className={`w-2 h-2 rounded-full ${contractConnected ? "bg-emerald-500" : "bg-amber-400 animate-pulse"}`} />
              {contractConnected ? "Contract Connected" : "Demo Mode"}
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              title={lastRefreshed ? `Last updated: ${lastRefreshed.toLocaleTimeString()}` : "Refresh"}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-colors disabled:opacity-50"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={refreshing ? "animate-spin" : ""}>
                <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1 max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text" value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search markets..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 text-zinc-700"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveFilter(cat)}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${activeFilter === cat ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400"}`}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {polymarketLive && (
          <div className="mb-6 flex items-center justify-between px-4 py-3 rounded-xl bg-blue-50 border border-blue-200">
            <div className="flex items-center gap-2 text-xs text-blue-700">
              <span className="text-base">📡</span>
              <span>
                <strong>Live data from Polymarket</strong> — auto-refreshing every 2 minutes.
                {lastRefreshed && <span className="text-blue-500 ml-1">Updated {lastRefreshed.toLocaleTimeString()}</span>}
              </span>
            </div>
            <a href="https://polymarket.com" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline hover:text-blue-800 whitespace-nowrap ml-3">
              View on Polymarket ↗
            </a>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
                <div className="h-1 shimmer" />
                <div className="p-5 space-y-3">
                  <div className="h-4 shimmer rounded-full w-1/3" />
                  <div className="h-5 shimmer rounded-lg w-full" />
                  <div className="h-5 shimmer rounded-lg w-4/5" />
                  <div className="h-2 shimmer rounded-full" />
                  <div className="grid grid-cols-3 gap-2">{[1,2,3].map(j => <div key={j} className="h-12 shimmer rounded-xl" />)}</div>
                  <div className="h-10 shimmer rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🔍</p>
            <p className="font-display font-bold text-zinc-700 text-xl mb-2">No markets found</p>
            <p className="text-zinc-400 text-sm">Try a different filter or search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((market, i) => (
              <MarketCard key={market.id} market={market} userBet={userBets[market.id]} onBetClick={openBetModal} index={i} />
            ))}
          </div>
        )}

        {!contractConnected && !loading && (
          <div className="mt-10 bg-zinc-950 text-white rounded-2xl p-6 text-center">
            <p className="font-display font-bold text-lg mb-2">🚀 Ready to go live?</p>
            <p className="text-zinc-400 text-sm mb-4">Deploy the smart contract to Sepolia and update <code className="text-gold-400">NEXT_PUBLIC_CONTRACT_ADDRESS</code>.</p>
            <code className="text-xs text-gold-400 font-mono bg-white/5 px-4 py-2 rounded-lg">npm run deploy:sepolia</code>
          </div>
        )}
      </div>

      {selectedMarket && (
        <BettingModal market={selectedMarket} walletAddress={walletAddress} onClose={() => setSelectedMarket(null)} onSuccess={handleBetSuccess} />
      )}
    </section>
  );
}