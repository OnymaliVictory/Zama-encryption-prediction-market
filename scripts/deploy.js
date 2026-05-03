const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  🔐 Private Prediction Market — Deploying");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`  Deployer: ${deployer.address}`);
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`  Balance:  ${hre.ethers.formatEther(balance)} ETH`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Deploy contract
  const PredictionMarket = await hre.ethers.getContractFactory("PrivatePredictionMarket");
  const contract = await PredictionMarket.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`  ✅ Contract deployed at: ${address}\n`);

  // Seed with markets (7 days duration)
  const SEVEN_DAYS  = 7 * 24 * 60 * 60;
  const THREE_DAYS  = 3 * 24 * 60 * 60;
  const THIRTY_DAYS = 30 * 24 * 60 * 60;

  const markets = [
    {
      question: "Will Bitcoin exceed $100,000 before the end of this month?",
      category: "crypto",
      duration: THIRTY_DAYS,
    },
    {
      question: "Will Elon Musk post more than 25 tweets in a single day this week?",
      category: "social",
      duration: SEVEN_DAYS,
    },
    {
      question: "Will Ethereum gas fees drop below 5 gwei this week?",
      category: "defi",
      duration: SEVEN_DAYS,
    },
    {
      question: "Will a major CEX announce a new meme coin listing this week?",
      category: "crypto",
      duration: SEVEN_DAYS,
    },
    {
      question: "Will the total DeFi TVL exceed $200 billion this month?",
      category: "defi",
      duration: THIRTY_DAYS,
    },
    {
      question: "Will $DOGE reach $0.50 before the next Bitcoin halving?",
      category: "crypto",
      duration: THIRTY_DAYS,
    },
    {
      question: "Will a new AI agent token enter the top 20 on CoinMarketCap this month?",
      category: "ai",
      duration: THIRTY_DAYS,
    },
    {
      question: "Will Ethereum flip Bitcoin in market cap by end of Q2 2025?",
      category: "crypto",
      duration: THIRTY_DAYS,
    },
    {
      question: "Will Base chain surpass Arbitrum in daily transactions this week?",
      category: "defi",
      duration: SEVEN_DAYS,
    },
    {
      question: "Will any NFT collection sell for over $1M this week?",
      category: "nft",
      duration: SEVEN_DAYS,
    },
    {
      question: "Will the SEC approve a new spot crypto ETF this month?",
      category: "regulation",
      duration: THIRTY_DAYS,
    },
    {
      question: "Will Solana suffer a network outage this week?",
      category: "crypto",
      duration: SEVEN_DAYS,
    },
    {
      question: "Will Vitalik Buterin tweet about Layer 3s this week?",
      category: "social",
      duration: SEVEN_DAYS,
    },
    {
      question: "Will a stablecoin lose its peg (>5% deviation) this week?",
      category: "defi",
      duration: THREE_DAYS,
    },
    {
      question: "Will the Bitcoin Fear & Greed Index hit 'Extreme Greed' (>80) this week?",
      category: "crypto",
      duration: SEVEN_DAYS,
    },
  ];

  console.log("  📋 Creating prediction markets...\n");

  for (let i = 0; i < markets.length; i++) {
    const { question, category, duration } = markets[i];
    const tx = await contract.createMarket(question, category, duration);
    await tx.wait();
    console.log(`  [${i}] ✓ ${question.slice(0, 60)}...`);
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  🎉 Deployment Complete!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`\n  Contract Address: ${address}`);
  console.log(`  Network:          ${hre.network.name}`);
  console.log(`  Markets Created:  ${markets.length}`);
  console.log("\n  ⚠️  Copy this address to frontend/.env.local:");
  console.log(`  NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
  console.log(`  NEXT_PUBLIC_CHAIN_ID=${hre.network.config.chainId}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Write deployment info to file
  const fs = require("fs");
  const deployInfo = {
    address,
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    marketCount: markets.length,
  };
  fs.writeFileSync(
    "./deployment.json",
    JSON.stringify(deployInfo, null, 2)
  );
  console.log("  📄 Deployment info saved to deployment.json\n");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
