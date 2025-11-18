import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm, deployments } from "hardhat";
import { EncryptedMemoryMatch } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  alice: HardhatEthersSigner;
};

describe("EncryptedMemoryMatchSepolia", function () {
  let signers: Signers;
  let encryptedMemoryMatchContract: EncryptedMemoryMatch;
  let encryptedMemoryMatchContractAddress: string;
  let step: number;
  let steps: number;

  function progress(message: string) {
    console.log(`${++step}/${steps} ${message}`);
  }

  before(async function () {
    if (fhevm.isMock) {
      console.warn(`This hardhat test suite can only run on Sepolia Testnet`);
      this.skip();
    }

    try {
      const EncryptedMemoryMatchDeployment = await deployments.get("EncryptedMemoryMatch");
      encryptedMemoryMatchContractAddress = EncryptedMemoryMatchDeployment.address;
      encryptedMemoryMatchContract = await ethers.getContractAt("EncryptedMemoryMatch", EncryptedMemoryMatchDeployment.address);
    } catch (e) {
      (e as Error).message += ". Call 'npx hardhat deploy --network sepolia'";
      throw e;
    }

    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { alice: ethSigners[0] };
  });

  beforeEach(async () => {
    step = 0;
    steps = 0;
  });

  it("should start and play a game on Sepolia", async function () {
    steps = 8;

    this.timeout(4 * 40000);

    progress("Generating public key...");
    const publicKey = await fhevm.generatePublicKey(encryptedMemoryMatchContractAddress, signers.alice.address);

    progress("Starting new game...");
    const tx = await encryptedMemoryMatchContract.connect(signers.alice).startGame(publicKey);
    await tx.wait();

    progress("Getting initial game state...");
    const initialGameState = await encryptedMemoryMatchContract.connect(signers.alice).getGameState();
    expect(initialGameState.gameEnded).to.equal(false);
    expect(initialGameState.steps).to.equal(0);

    progress("Making first card flip...");
    const encryptedCardIndex = await fhevm
      .createEncryptedInput(encryptedMemoryMatchContractAddress, signers.alice.address)
      .add8(0)
      .encrypt();

    let flipTx = await encryptedMemoryMatchContract
      .connect(signers.alice)
      .flipCard(0, encryptedCardIndex.inputProof);
    await flipTx.wait();

    progress("Making second card flip...");
    const encryptedCardIndex2 = await fhevm
      .createEncryptedInput(encryptedMemoryMatchContractAddress, signers.alice.address)
      .add8(1)
      .encrypt();

    flipTx = await encryptedMemoryMatchContract
      .connect(signers.alice)
      .flipCard(1, encryptedCardIndex2.inputProof);
    await flipTx.wait();

    progress("Getting updated game state...");
    const updatedGameState = await encryptedMemoryMatchContract.connect(signers.alice).getGameState();
    expect(updatedGameState.steps).to.equal(1);

    progress("Getting player statistics...");
    const playerStats = await encryptedMemoryMatchContract.connect(signers.alice).getPlayerStats();

    progress(`Game state - Steps: ${updatedGameState.steps}, Games played: ${playerStats.gamesPlayed}`);
  });

  it("should retrieve leaderboard", async function () {
    steps = 3;

    progress("Retrieving leaderboard...");
    const leaderboard = await encryptedMemoryMatchContract.getLeaderboard();

    progress(`Retrieved leaderboard with ${leaderboard.players.filter(p => p !== ethers.ZeroAddress).length} entries`);

    progress("Retrieving player rank...");
    const playerRank = await encryptedMemoryMatchContract.connect(signers.alice).getPlayerRank();

    progress(`Player rank: ${playerRank.rank}, Score: ${playerRank.score}`);
  });
});


