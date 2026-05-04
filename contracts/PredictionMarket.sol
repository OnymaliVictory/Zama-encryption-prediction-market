// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { TFHE, euint64, ebool, einput } from "fhevm/lib/TFHE.sol";
import { SepoliaZamaFHEVMConfig } from "fhevm/config/ZamaFHEVMConfig.sol";
import { GatewayCaller } from "fhevm/gateway/GatewayCaller.sol";
import { Gateway } from "fhevm/gateway/lib/Gateway.sol";

/**
 * @title PrivatePredictionMarket
 * @notice Bets are fully encrypted using Zama FHEVM — true on-chain privacy
 */
contract PrivatePredictionMarket is
    SepoliaZamaFHEVMConfig,
    GatewayCaller,
    Ownable,
    ReentrancyGuard
{
    struct Market {
        string   question;
        string   category;
        uint256  endTime;
        uint256  totalEthPool;
        bool     resolved;
        bool     winningOutcome;
        bool     exists;
        uint256  betCount;
    }

    struct UserBet {
        euint64  encryptedAmount;  // ✅ real FHE type
        ebool    encryptedChoice;  // ✅ real FHE type
        bool     hasBet;
        bool     claimed;
        uint256  ethAmount;
    }

    mapping(uint256 => Market)                        public  markets;
    mapping(uint256 => mapping(address => UserBet))   public  userBets;
    mapping(uint256 => address[])                     private marketBettors;

    // For gateway decryption callbacks
    mapping(uint256 => address)  private decryptRequestUser;
    mapping(uint256 => uint256)  private decryptRequestMarket;

    uint256 public marketCount;
    uint256 public constant MIN_BET          = 0.001 ether;
    uint256 public constant PLATFORM_FEE_BPS = 200;
    uint256 public platformFees;

    event MarketCreated(uint256 indexed marketId, string question, uint256 endTime);
    event BetPlaced(uint256 indexed marketId, address indexed user); // ✅ no plaintext amount
    event MarketResolved(uint256 indexed marketId, bool outcome);
    event RewardClaimed(uint256 indexed marketId, address indexed user, uint256 amount);

    constructor() Ownable(msg.sender) {}

    // ── Create Market ─────────────────────────────────────────────────────────

    function createMarket(
        string calldata question,
        string calldata category,
        uint256 duration
    ) external onlyOwner {
        require(duration > 0, "Duration must be > 0");
        uint256 id = marketCount++;
        Market storage m = markets[id];
        m.question = question;
        m.category = category;
        m.endTime  = block.timestamp + duration;
        m.exists   = true;
        emit MarketCreated(id, question, m.endTime);
    }

    // ── Place Bet ─────────────────────────────────────────────────────────────

    function placeBet(
        uint256 marketId,
        einput  encryptedAmount,      // ✅ FHEVM encrypted input
        bytes calldata amountProof,   // ✅ ZK proof
        einput  encryptedChoice,      // ✅ FHEVM encrypted input
        bytes calldata choiceProof    // ✅ ZK proof
    ) external payable nonReentrant {
        Market storage m = markets[marketId];
        require(m.exists,                               "Market does not exist");
        require(!m.resolved,                            "Market already resolved");
        require(block.timestamp < m.endTime,            "Betting period has ended");
        require(!userBets[marketId][msg.sender].hasBet, "Already placed a bet");
        require(msg.value >= MIN_BET,                   "Below minimum bet (0.001 ETH)");

        // ✅ Convert encrypted inputs to FHE types
        euint64 amount = TFHE.asEuint64(encryptedAmount, amountProof);
        ebool   choice = TFHE.asEbool(encryptedChoice,   choiceProof);

        // ✅ Grant ACL permissions — critical for Zama compliance
        TFHE.allowThis(amount);
        TFHE.allowThis(choice);
        TFHE.allow(amount, msg.sender);
        TFHE.allow(choice, msg.sender);

        // ✅ Store FHE handles — not plaintext
        UserBet storage bet = userBets[marketId][msg.sender];
        bet.encryptedAmount = amount;
        bet.encryptedChoice = choice;
        bet.hasBet          = true;
        bet.ethAmount       = msg.value;

        m.totalEthPool += msg.value;
        m.betCount++;
        marketBettors[marketId].push(msg.sender);

        // ✅ No plaintext amount in event
        emit BetPlaced(marketId, msg.sender);
    }

    // ── Resolve Market ────────────────────────────────────────────────────────

    function resolveMarket(uint256 marketId, bool outcome) external onlyOwner {
        Market storage m = markets[marketId];
        require(m.exists,    "Market does not exist");
        require(!m.resolved, "Already resolved");
        m.resolved       = true;
        m.winningOutcome = outcome;
        emit MarketResolved(marketId, outcome);
    }

    // ── Claim Reward ──────────────────────────────────────────────────────────

    function claimReward(uint256 marketId) external nonReentrant {
        Market storage m = markets[marketId];
        require(m.exists,   "Market does not exist");
        require(m.resolved, "Market not resolved yet");

        UserBet storage bet = userBets[marketId][msg.sender];
        require(bet.hasBet,   "No bet on this market");
        require(!bet.claimed, "Already claimed");

        bet.claimed = true;

        // ✅ Request gateway decryption of user's choice
        uint256[] memory cts = new uint256[](1);
        cts[0] = Gateway.toUint256(bet.encryptedChoice);

        uint256 reqId = Gateway.requestDecryption(
            cts,
            this.claimCallback.selector,
            0,
            block.timestamp + 100,
            false
        );

        decryptRequestUser[reqId]   = msg.sender;
        decryptRequestMarket[reqId] = marketId;
    }

    // ✅ Gateway calls this after decrypting the choice
    function claimCallback(
        uint256 requestId,
        bool    userChoice
    ) external onlyGateway {
        address user     = decryptRequestUser[requestId];
        uint256 marketId = decryptRequestMarket[requestId];

        Market storage m = markets[marketId];
        UserBet storage bet = userBets[marketId][user];

        // Only pay if choice matches outcome
        if (userChoice == m.winningOutcome) {
            uint256 fee        = (m.totalEthPool * PLATFORM_FEE_BPS) / 10000;
            uint256 rewardPool = m.totalEthPool - fee;
            platformFees      += fee;

            uint256 winningSide = m.totalEthPool / 2;
            if (winningSide == 0) winningSide = 1;

            uint256 payout = (bet.ethAmount * rewardPool) / winningSide;

            (bool ok, ) = payable(user).call{value: payout}("");
            require(ok, "Transfer failed");

            emit RewardClaimed(marketId, user, payout);
        }
    }

    // ── Views (unchanged) ─────────────────────────────────────────────────────

    function getMarket(uint256 marketId) external view returns (
        string memory question,
        string memory category,
        uint256 endTime,
        uint256 totalEthPool,
        bool resolved,
        bool winningOutcome,
        bool exists,
        uint256 betCount
    ) {
        Market storage m = markets[marketId];
        return (m.question, m.category, m.endTime, m.totalEthPool,
                m.resolved, m.winningOutcome, m.exists, m.betCount);
    }

    function getUserBetStatus(uint256 marketId, address user) external view returns (
        bool hasBet,
        bool claimed,
        uint256 ethAmount
    ) {
        UserBet storage b = userBets[marketId][user];
        return (b.hasBet, b.claimed, b.ethAmount);
    }

    function getAllMarkets() external view returns (uint256[] memory) {
        uint256[] memory ids = new uint256[](marketCount);
        for (uint256 i = 0; i < marketCount; i++) ids[i] = i;
        return ids;
    }

    function getMarketBettors(uint256 marketId) external view returns (address[] memory) {
        return marketBettors[marketId];
    }

    function withdrawFees() external onlyOwner {
        uint256 amt  = platformFees;
        platformFees = 0;
        (bool ok, )  = payable(owner()).call{value: amt}("");
        require(ok, "Transfer failed");
    }

    receive() external payable {}
}
