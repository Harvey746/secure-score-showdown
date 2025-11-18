import { task } from "hardhat/config";
import { EncryptedMemoryMatch } from "../types";

task("encrypted-memory-match:start-game", "Start a new encrypted memory match game")
  .setAction(async (_, hre) => {
    const { ethers, fhevm } = hre;

    const [signer] = await ethers.getSigners();
    const contractAddress = (await hre.deployments.get("EncryptedMemoryMatch")).address;
    const contract = await ethers.getContractAt("EncryptedMemoryMatch", contractAddress) as EncryptedMemoryMatch;

    console.log("Starting new encrypted memory match game...");
    console.log("Contract address:", contractAddress);
    console.log("Player:", signer.address);

    const publicKey = await fhevm.generatePublicKey(contractAddress, signer.address);

    const tx = await contract.startGame(publicKey);
    await tx.wait();

    console.log("Game started successfully!");
    console.log("Transaction hash:", tx.hash);

    const gameState = await contract.getGameState();
    console.log("Game session ID:", gameState.sessionId);
    console.log("Board size:", gameState.board.length);
  });

task("encrypted-memory-match:get-stats", "Get player statistics")
  .setAction(async (_, hre) => {
    const { ethers } = hre;

    const [signer] = await ethers.getSigners();
    const contractAddress = (await hre.deployments.get("EncryptedMemoryMatch")).address;
    const contract = await ethers.getContractAt("EncryptedMemoryMatch", contractAddress) as EncryptedMemoryMatch;

    console.log("Getting player statistics for:", signer.address);

    const stats = await contract.getPlayerStats();

    console.log("Player Statistics:");
    console.log("- Total Score:", stats.totalScore);
    console.log("- Games Played:", stats.gamesPlayed);
    console.log("- Games Won:", stats.gamesWon);
    console.log("- Best Score:", stats.bestScore);
  });

task("encrypted-memory-match:get-leaderboard", "Get current leaderboard")
  .setAction(async (_, hre) => {
    const { ethers } = hre;

    const contractAddress = (await hre.deployments.get("EncryptedMemoryMatch")).address;
    const contract = await ethers.getContractAt("EncryptedMemoryMatch", contractAddress) as EncryptedMemoryMatch;

    console.log("Getting leaderboard...");

    const leaderboard = await contract.getLeaderboard();

    console.log("Leaderboard (Top 10):");
    for (let i = 0; i < leaderboard.players.length; i++) {
      if (leaderboard.players[i] !== ethers.ZeroAddress) {
        console.log(`${i + 1}. ${leaderboard.players[i]} - Score: ${leaderboard.scores[i]} (${new Date(leaderboard.timestamps[i] * 1000).toLocaleString()})`);
      }
    }
  });

task("encrypted-memory-match:reset-game", "Reset current game (for testing)")
  .setAction(async (_, hre) => {
    const { ethers } = hre;

    const [signer] = await ethers.getSigners();
    const contractAddress = (await hre.deployments.get("EncryptedMemoryMatch")).address;
    const contract = await ethers.getContractAt("EncryptedMemoryMatch", contractAddress) as EncryptedMemoryMatch;

    console.log("Resetting game for:", signer.address);

    const tx = await contract.resetGame();
    await tx.wait();

    console.log("Game reset successfully!");
    console.log("Transaction hash:", tx.hash);
  });


