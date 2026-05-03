"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { connectWallet, getWalletBalance, shortenAddress, switchNetwork } from "../lib/contract";
import { CHAIN_ID, NETWORK_NAME, CONTRACT_ADDRESS, CONTRACT_ABI } from "../lib/contractABI";
import toast from "react-hot-toast";

function maskAddress(addr) {
  return addr.slice(0, 8) + "xxxxxxxxx" + addr.slice(-4);
}

async function fetchAllBettors() {
  try {
    const { ethers } = await import("ethers");
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    const count = await contract.marketCount();
    const bettorSet = new Set();
    for (let i = 0; i < Number(count); i++) {
      try {
        const bettors = await contract.getMarketBettors(i);
        bettors.forEach(b => bettorSet.add(b.toLowerCase()));
      } catch {}
    }
    return Array.from(bettorSet);
  } catch (err) {
    console.warn("[History] Could not fetch bettors:", err.message);
    return [];
  }
}

export default function Navbar() {
  const [wallet, setWallet]           = useState(null);
  const [balance, setBalance]         = useState(null);
  const [dropping, setDropping]       = useState(false);
  const [networkOk, setNetworkOk]     = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [bettors, setBettors]         = useState([]);
  const [loadingBettors, setLoadingBettors] = useState(false);
  const dropRef    = useRef(null);
  const historyRef = useRef(null);

  // Load real bettors from contract
  const loadBettors = useCallback(async () => {
    setLoadingBettors(true);
    const list = await fetchAllBettors();
    setBettors(list);
    setLoadingBettors(false);
  }, []);

  // Load on mount
  useEffect(() => { loadBettors(); }, [loadBettors]);

  // Refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(loadBettors, 30000);
    return () => clearInterval(interval);
  }, [loadBettors]);

  // Load persisted wallet on mount
  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;

    const tryReconnect = async () => {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          const { ethers } = await import("ethers");
          const provider = new ethers.BrowserProvider(window.ethereum);
          const network  = await provider.getNetwork();
          setNetworkOk(Number(network.chainId) === CHAIN_ID);
          const signer = await provider.getSigner();
          setWallet({ address: accounts[0], signer });
          const bal = await getWalletBalance(accounts[0]);
          setBalance(bal);
        }
      } catch {}
    };

    tryReconnect();

    window.ethereum.on("accountsChanged", async (accounts) => {
      if (accounts.length === 0) {
        setWallet(null);
        setBalance(null);
        toast("Wallet disconnected", { icon: "👋" });
      } else {
        const bal = await getWalletBalance(accounts[0]);
        setWallet((prev) => ({ ...prev, address: accounts[0] }));
        setBalance(bal);
        toast.success(`Switched to ${shortenAddress(accounts[0])}`);
      }
    });

    window.ethereum.on("chainChanged", () => window.location.reload());

    return () => {
      window.ethereum?.removeAllListeners?.("accountsChanged");
      window.ethereum?.removeAllListeners?.("chainChanged");
    };
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropping(false);
      if (historyRef.current && !historyRef.current.contains(e.target)) setShowHistory(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleConnect = async () => {
    try {
      const { address, signer } = await connectWallet();
      setWallet({ address, signer });
      const bal = await getWalletBalance(address);
      setBalance(bal);
      setNetworkOk(true);
      toast.success("Wallet connected!");
      loadBettors(); // refresh history after connecting
    } catch (err) {
      toast.error(err.message || "Failed to connect");
    }
  };

  const handleDisconnect = () => {
    setWallet(null);
    setBalance(null);
    setDropping(false);
    toast("Disconnected", { icon: "👋" });
  };

  const handleSwitchNetwork = async () => {
    try {
      await switchNetwork();
      setNetworkOk(true);
      toast.success(`Switched to ${NETWORK_NAME}`);
    } catch (err) {
      toast.error("Could not switch network");
    }
  };

  const handleSwitchWallet = async () => {
    try {
      await window.ethereum.request({ method: "wallet_requestPermissions", params: [{ eth_accounts: {} }] });
    } catch {}
    setDropping(false);
  };

  const handleOpenHistory = () => {
    setShowHistory(!showHistory);
    setDropping(false);
    if (!showHistory) loadBettors(); // refresh when opening
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gold-gradient flex items-center justify-center shadow-gold">
                <span className="text-zinc-900 font-bold font-display text-sm">Z</span>
              </div>
              <div>
                <span className="font-display font-bold text-lg text-zinc-900 tracking-tight">ZeroKnow</span>
                <span className="hidden sm:inline ml-2 badge bg-gold-50 text-gold-700 border border-gold-200 text-[10px]">
                  FHE-Powered
                </span>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">

              {/* History button */}
              <div className="relative" ref={historyRef}>
                <button
                  onClick={handleOpenHistory}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 transition-all shadow-sm text-xs font-semibold text-zinc-600"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <span className="hidden sm:inline">History</span>
                  {bettors.length > 0 && (
                    <span className="w-4 h-4 rounded-full bg-gold-500 text-white text-[9px] font-bold flex items-center justify-center">
                      {bettors.length > 9 ? "9+" : bettors.length}
                    </span>
                  )}
                </button>

                {/* History panel */}
                {showHistory && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl border border-zinc-200 shadow-card-hover py-1 animate-fade-in z-50">

                    {/* Header */}
                    <div className="px-4 py-3 border-b border-zinc-100">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm text-zinc-900">Bettor History</p>
                        <div className="flex items-center gap-2">
                          <span className="badge bg-zinc-100 text-zinc-500 border border-zinc-200 text-[10px]">
                            {loadingBettors ? "..." : `${bettors.length} wallets`}
                          </span>
                          <button
                            onClick={loadBettors}
                            disabled={loadingBettors}
                            className="text-zinc-400 hover:text-zinc-600 transition-colors"
                            title="Refresh"
                          >
                            <svg
                              width="11" height="11" viewBox="0 0 24 24" fill="none"
                              stroke="currentColor" strokeWidth="2.5"
                              className={loadingBettors ? "animate-spin" : ""}
                            >
                              <path d="M23 4v6h-6"/>
                              <path d="M1 20v-6h6"/>
                              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-1">
                        Wallet addresses only — all bet details are private 🔒
                      </p>
                    </div>

                    {/* List */}
                    <div className="max-h-64 overflow-y-auto py-1">
                      {loadingBettors ? (
                        <div className="px-4 py-6 text-center">
                          <div className="w-5 h-5 border-2 border-zinc-200 border-t-gold-500 rounded-full animate-spin mx-auto mb-2" />
                          <p className="text-xs text-zinc-400">Loading bettors...</p>
                        </div>
                      ) : bettors.length === 0 ? (
                        <div className="px-4 py-6 text-center">
                          <p className="text-2xl mb-2">🎯</p>
                          <p className="text-xs text-zinc-400">No bets placed yet</p>
                          <p className="text-[10px] text-zinc-300 mt-1">Be the first to bet!</p>
                        </div>
                      ) : (
                        bettors.map((addr, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-50 transition-colors"
                          >
                            <div className="w-6 h-6 rounded-full bg-gold-gradient flex items-center justify-center text-[9px] font-bold text-zinc-900 shrink-0">
                              {addr.slice(2, 4).toUpperCase()}
                            </div>
                            <span className="font-mono text-xs text-zinc-600 truncate">
                              {maskAddress(addr)}
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-2.5 border-t border-zinc-100">
                      <p className="text-[10px] text-zinc-400 text-center font-mono">
                        🔐 Bet amounts &amp; choices encrypted by FHE
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Network warning */}
              {wallet && !networkOk && (
                <button
                  onClick={handleSwitchNetwork}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold hover:bg-red-100 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Wrong Network
                </button>
              )}

              {/* Network indicator when OK */}
              {wallet && networkOk && (
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {NETWORK_NAME}
                </div>
              )}

              {/* Wallet button */}
              {!wallet ? (
                <button
                  onClick={handleConnect}
                  className="btn-gold px-4 py-2 text-sm rounded-lg font-semibold flex items-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="2" y="7" width="20" height="14" rx="2"/>
                    <path d="M16 12h.01M2 10l10-7 10 7"/>
                  </svg>
                  Connect Wallet
                </button>
              ) : (
                <div className="relative" ref={dropRef}>
                  <button
                    onClick={() => { setDropping(!dropping); setShowHistory(false); }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 transition-all shadow-sm"
                  >
                    <div className="w-7 h-7 rounded-full bg-gold-gradient flex items-center justify-center text-xs font-bold text-zinc-900">
                      {wallet.address.slice(2, 4).toUpperCase()}
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-xs font-semibold text-zinc-900 font-mono">
                        {shortenAddress(wallet.address)}
                      </div>
                      {balance && (
                        <div className="text-[10px] text-zinc-500 font-mono">{balance} ETH</div>
                      )}
                    </div>
                    <svg
                      width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2"
                      className={`text-zinc-400 transition-transform ${dropping ? "rotate-180" : ""}`}
                    >
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>

                  {dropping && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-zinc-200 shadow-card-hover py-1 animate-fade-in">
                      <div className="px-4 py-3 border-b border-zinc-100">
                        <p className="text-xs text-zinc-400 mb-1">Connected as</p>
                        <p className="font-mono text-sm font-semibold text-zinc-900 truncate">{wallet.address}</p>
                        {balance && <p className="font-mono text-xs text-zinc-500 mt-0.5">{balance} ETH</p>}
                      </div>

                      <button
                        onClick={handleSwitchWallet}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17 1l4 4-4 4"/>
                          <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                          <path d="M7 23l-4-4 4-4"/>
                          <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                        </svg>
                        Switch Wallet
                      </button>

                      {!networkOk && (
                        <button
                          onClick={handleSwitchNetwork}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-amber-700 hover:bg-amber-50 transition-colors"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                          </svg>
                          Switch to {NETWORK_NAME}
                        </button>
                      )}

                      <div className="border-t border-zinc-100 mt-1">
                        <button
                          onClick={handleDisconnect}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                            <polyline points="16 17 21 12 16 7"/>
                            <line x1="21" y1="12" x2="9" y2="12"/>
                          </svg>
                          Disconnect
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}