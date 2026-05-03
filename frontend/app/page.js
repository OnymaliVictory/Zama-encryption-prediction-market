"use client";
import { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import MarketsGrid from "../components/MarketsGrid";
import HowItWorks from "../components/HowItWorks";
import PrivacyVerifier from "../components/PrivacyVerifier";
import Footer from "../components/Footer";

export default function HomePage() {
  const [walletAddress, setWalletAddress] = useState(null);
  const marketsRef = useRef(null);

  // Sync wallet address from MetaMask events
  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;

    const syncWallet = async () => {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) setWalletAddress(accounts[0]);
      } catch {}
    };
    syncWallet();

    window.ethereum.on("accountsChanged", (accounts) => {
      setWalletAddress(accounts[0] || null);
    });
    return () => window.ethereum?.removeAllListeners?.("accountsChanged");
  }, []);

  const scrollToMarkets = () => {
    marketsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar onWalletChange={setWalletAddress} />

      <Hero onExploreClick={scrollToMarkets} />

      <MarketsGrid
        walletAddress={walletAddress}
        sectionRef={marketsRef}
      />

      <HowItWorks />

      <PrivacyVerifier />

      <Footer />
    </main>
  );
}
