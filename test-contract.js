const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Testing EncryptedMemoryMatch contract deployment...");

  // Get the deployed contract
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const EncryptedMemoryMatch = await ethers.getContractFactory("EncryptedMemoryMatch");
  const contract = EncryptedMemoryMatch.attach(contractAddress);

  console.log("✅ Contract attached at:", contractAddress);

  // Test basic functionality
  const [signer] = await ethers.getSigners();
  console.log("🧑‍💻 Using account:", signer.address);

  // Start a new game
  console.log("🎮 Starting a new game...");
  const tx = await contract.startGame();
  await tx.wait();
  console.log("✅ Game started successfully!");

  // Get game state
  const gameState = await contract.getGameState();
  console.log("🎯 Game state retrieved:");
  console.log("  - Session ID:", gameState[0].toString());
  console.log("  - Board size:", gameState[1].length);
  console.log("  - Steps:", gameState[4].toString());
  console.log("  - Game ended:", gameState[6]);

  console.log("🎉 Contract is working perfectly!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Contract test failed:", error);
    process.exit(1);
  });


