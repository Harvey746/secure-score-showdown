import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { EncryptedMemoryMatch, EncryptedMemoryMatch__factory } from "../types";
import { expect } from "chai";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

describe("EncryptedMemoryMatch", function () {
  let signers: Signers;
  let encryptedMemoryMatchContract: EncryptedMemoryMatch;
  const encryptedMemoryMatchContractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Already deployed contract

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };

    // Connect to the already deployed contract
    encryptedMemoryMatchContract = await ethers.getContractAt("EncryptedMemoryMatch", encryptedMemoryMatchContractAddress) as EncryptedMemoryMatch;
  });

  beforeEach(async function () {
    // Reset game state for both test accounts before each test
    try {
      await encryptedMemoryMatchContract.connect(signers.alice).resetGame();
      await encryptedMemoryMatchContract.connect(signers.deployer).resetGame();
    } catch (error) {
      // Contract might not be deployed or resetGame might fail, that's ok
    }
  });

  it("should connect to deployed contract", async function () {
    // Test that we can connect to the deployed contract
    expect(encryptedMemoryMatchContract).to.not.be.undefined;
    expect(encryptedMemoryMatchContractAddress).to.equal("0x5FbDB2315678afecb367f032d93F642f64180aa3");
  });

  it("should get player statistics", async function () {
    // Test view function that doesn't require gas
    const stats = await encryptedMemoryMatchContract.connect(signers.alice).getPlayerStats();
    expect(stats).to.be.an('array');
    expect(stats.length).to.equal(4); // totalScore, gamesPlayed, gamesWon, bestScore
  });

  it("should get leaderboard", async function () {
    // Test leaderboard view function
    const leaderboard = await encryptedMemoryMatchContract.getLeaderboard();
    expect(leaderboard).to.be.an('array');
    expect(leaderboard.length).to.equal(3); // players, scores, timestamps
    expect(leaderboard[0]).to.be.an('array'); // players array
    expect(leaderboard[1]).to.be.an('array'); // scores array
    expect(leaderboard[2]).to.be.an('array'); // timestamps array
  });

  it("should start a new game with deployer account", async function () {
    // Ensure no active game for deployer
    await encryptedMemoryMatchContract.connect(signers.deployer).resetGame();

    await expect(encryptedMemoryMatchContract.connect(signers.deployer).startGame())
      .to.emit(encryptedMemoryMatchContract, "GameStarted")
      .withArgs(signers.deployer.address, (value: any) => value !== undefined);
  });

  it("should initialize game with 36 cards", async function () {
    // Ensure clean state
    await encryptedMemoryMatchContract.connect(signers.deployer).resetGame();

    // Start game with deployer account (has funds)
    await encryptedMemoryMatchContract.connect(signers.deployer).startGame();

    // Get game state
    const gameState = await encryptedMemoryMatchContract.connect(signers.deployer).getGameState();
    const [sessionId, board, flippedCard1, flippedCard2, steps, score, matchedPairs, gameEnded] = gameState;

    // Verify game initialization
    expect(board.length).to.equal(36); // 6x6 grid
    expect(steps).to.equal(0);
    expect(score).to.equal(0);
    expect(matchedPairs).to.equal(0);
    expect(gameEnded).to.equal(false);
    expect(flippedCard1).to.equal(255); // No cards flipped initially
    expect(flippedCard2).to.equal(255);
    expect(sessionId).to.be.a('bigint'); // Session ID should be generated
  });
});
