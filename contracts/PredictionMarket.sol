// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PrivatePredictionMarket
 * @notice Bets are stored as encrypted bytes — private on-chain
 */
contract PrivatePredictionMarket is Ownable, ReentrancyGuard {

    struct Market {
        string question;
        string category;
        uint256 endTime;
        uint256 totalEthPool;
        bool resolved;
        bool winningOutcome;
        bool exists;
        uint256 betCount;
    }

    struct UserBet {
        bytes32 encryptedAmount;  // FHE ciphertext handle
        bytes32 encryptedChoice;  // FHE ciphertext handle
        bytes   amountProof;      // ZK proof
        bytes   choiceProof;      // ZK proof
        bool    hasBet;
        bool    claimed;
        uint256 ethAmount;
    }

    mapping(uint256 => Market) public markets;
    mapping(uint256 => mapping(address => UserBet)) public userBets;
    mapping(uint256 => address[]) private marketBettors;

    uint256 public marketCount;
    uint256 public constant MIN_BET = 0.001 ether;
    uint256 public constant PLATFORM_FEE_BPS = 200;
    uint256 public platformFees;

    event MarketCreated(uint256 indexed marketId, string question, uint256 endTime);
    event BetPlaced(uint256 indexed marketId, address indexed user, uint256 ethAmount);
    event MarketResolved(uint256 indexed marketId, bool outcome);
    event RewardClaimed(uint256 indexed marketId, address indexed user, uint256 amount);

    constructor() Ownable(msg.sender) {}

    function createMarket(
        string calldata question,
        string calldata category,
        uint256 duration
    ) external onlyOwner {
        require(duration > 0, "Duration must be > 0");
        uint256 id = marketCount++;
        Market storage m = markets[id];
        m.question  = question;
        m.category  = category;
        m.endTime   = block.timestamp + duration;
        m.exists    = true;
        emit MarketCreated(id, question, m.endTime);
    }

    function placeBet(
        uint256 marketId,
        bytes32 encryptedAmount,
        bytes calldata amountProof,
        bytes32 encryptedChoice,
        bytes calldata choiceProof
    ) external payable nonReentrant {
        Market storage m = markets[marketId];
        require(m.exists,                               "Market does not exist");
        require(!m.resolved,                            "Market already resolved");
        require(block.timestamp < m.endTime,            "Betting period has ended");
        require(!userBets[marketId][msg.sender].hasBet, "Already placed a bet");
        require(msg.value >= MIN_BET,                   "Below minimum bet (0.001 ETH)");

        UserBet storage bet = userBets[marketId][msg.sender];
        bet.encryptedAmount = encryptedAmount;
        bet.encryptedChoice = encryptedChoice;
        bet.amountProof     = amountProof;
        bet.choiceProof     = choiceProof;
        bet.hasBet          = true;
        bet.ethAmount       = msg.value;

        m.totalEthPool += msg.value;
        m.betCount++;
        marketBettors[marketId].push(msg.sender);

        emit BetPlaced(marketId, msg.sender, msg.value);
    }

    function resolveMarket(uint256 marketId, bool outcome) external onlyOwner {
        Market storage m = markets[marketId];
        require(m.exists,    "Market does not exist");
        require(!m.resolved, "Already resolved");
        m.resolved       = true;
        m.winningOutcome = outcome;
        emit MarketResolved(marketId, outcome);
    }

    function claimReward(uint256 marketId) external nonReentrant {
        Market storage m = markets[marketId];
        require(m.exists,   "Market does not exist");
        require(m.resolved, "Market not resolved yet");

        UserBet storage bet = userBets[marketId][msg.sender];
        require(bet.hasBet,   "No bet on this market");
        require(!bet.claimed, "Already claimed");

        bet.claimed = true;

        uint256 fee        = (m.totalEthPool * PLATFORM_FEE_BPS) / 10000;
        uint256 rewardPool = m.totalEthPool - fee;
        platformFees      += fee;

        uint256 winningSide = m.totalEthPool / 2;
        if (winningSide == 0) winningSide = 1;

        uint256 payout = (bet.ethAmount * rewardPool) / winningSide;

        (bool ok, ) = payable(msg.sender).call{value: payout}("");
        require(ok, "Transfer failed");

        emit RewardClaimed(marketId, msg.sender, payout);
    }

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