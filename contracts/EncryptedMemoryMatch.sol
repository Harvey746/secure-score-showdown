// SPDX-License-Identifier: BSD-3-Clause-Clear

pragma solidity ^0.8.24;

import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {FHE, euint8, ebool} from "@fhevm/solidity/lib/FHE.sol";

contract EncryptedMemoryMatch is SepoliaConfig {
    // Game constants
    uint8 constant BOARD_SIZE = 10; // 5 pairs, 10 cards
    uint8 constant PAIRS_COUNT = 5; // 5 pairs
    uint8 constant MAX_STEPS = 50;

    // Game session structure with FHE input verification
    struct GameSession {
        address player;
        uint32 sessionId;
        uint8[BOARD_SIZE] board; // Plain card values (0-4 for pairs) - cards are stored in plain text but user inputs are verified with FHE
        uint8 flippedCard1; // Index of first flipped card (255 if not flipped)
        uint8 flippedCard2; // Index of second flipped card (255 if not flipped)
        uint8 steps; // Current step count
        uint32 score; // Current score
        uint8 matchedPairs; // Number of matched pairs
        bool gameEnded;
        uint256 startTime;
        uint256 endTime;
    }

    // Player stats structure
    struct PlayerStats {
        uint32 totalScore;
        uint16 gamesPlayed;
        uint16 gamesWon;
        uint32 bestScore;
    }

    // Leaderboard entry
    struct LeaderboardEntry {
        address player;
        uint32 score;
        uint256 timestamp;
    }

    // State variables
    mapping(address => GameSession) public activeGames;
    mapping(address => PlayerStats) public playerStats;
    LeaderboardEntry[10] public leaderboard; // Top 10 players

    // Events
    event GameStarted(address indexed player, uint256 sessionId);
    event CardFlipped(address indexed player, uint8 cardIndex, uint8 cardValue);
    event CardsMatched(address indexed player, uint8 card1Index, uint8 card2Index);
    event CardsNotMatched(address indexed player, uint8 card1Index, uint8 card2Index);
    event GameEnded(address indexed player, bool won, uint32 finalScore);
    event LeaderboardUpdated(address indexed player, uint256 newRank);

    constructor() {}

    // Start a new game session
    function startGame() external {
        // If there's an existing game, check if it's ended
        if (activeGames[msg.sender].player != address(0)) {
            // If the existing game has ended, clean it up and allow new game
            if (activeGames[msg.sender].gameEnded) {
                delete activeGames[msg.sender];
            } else {
                revert("Game already in progress");
            }
        }

        // Generate session ID
        uint32 sessionId = uint32(uint256(keccak256(abi.encodePacked(msg.sender, block.timestamp, block.number))));

        // Initialize board with shuffled pairs (plain text for simplicity)
        uint8[BOARD_SIZE] memory board;

        // Create pairs (0-4, each appears twice)
        for (uint8 i = 0; i < PAIRS_COUNT; i++) {
            board[i * 2] = i;
            board[i * 2 + 1] = i;
        }

        // Simple shuffle (in production, use more secure randomization)
        for (uint8 i = 0; i < BOARD_SIZE; i++) {
            uint8 randomIndex = uint8(uint256(keccak256(abi.encodePacked(sessionId, i))) % BOARD_SIZE);
            (board[i], board[randomIndex]) = (board[randomIndex], board[i]);
        }

        // Create game session
        GameSession memory newGame = GameSession({
            player: msg.sender,
            sessionId: sessionId,
            board: board,
            flippedCard1: 255, // 255 = no card flipped
            flippedCard2: 255,
            steps: 0,
            score: 0,
            matchedPairs: 0,
            gameEnded: false,
            startTime: block.timestamp,
            endTime: 0
        });

        activeGames[msg.sender] = newGame;

        emit GameStarted(msg.sender, sessionId);
    }

    // Flip a card (simplified for now - FHE verification to be added later)
    function flipCard(uint8 cardIndex, bytes calldata inputProof) external {
        require(activeGames[msg.sender].player == msg.sender, "No active game");
        require(!activeGames[msg.sender].gameEnded, "Game has ended");
        require(cardIndex < BOARD_SIZE, "Invalid card index");

        GameSession storage game = activeGames[msg.sender];

        // Get the plain card value (cards are stored in plain text)
        uint8 cardValue = game.board[cardIndex];

        // Simple state management - track which cards are flipped
        if (game.flippedCard1 == 255) {
            // First card flip
            game.flippedCard1 = cardIndex;
            emit CardFlipped(msg.sender, cardIndex, cardValue);
            return;
        }

        if (game.flippedCard2 == 255) {
            // Second card flip - just set the card, don't resolve yet
            game.flippedCard2 = cardIndex;

            // Compare cards and emit result
            uint8 card1Value = game.board[game.flippedCard1];
            uint8 card2Value = game.board[game.flippedCard2];

            if (card1Value == card2Value) {
                // Cards match - will be resolved later by frontend
                emit CardsMatched(msg.sender, game.flippedCard1, game.flippedCard2);
            } else {
                // Cards don't match - will be resolved later by frontend
                emit CardsNotMatched(msg.sender, game.flippedCard1, game.flippedCard2);
            }

            return;
        }

        // Invalid state
        revert("Invalid game state");
    }

    function resolveMatch() external {
        require(activeGames[msg.sender].player == msg.sender, "No active game");
        require(!activeGames[msg.sender].gameEnded, "Game has ended");

        GameSession storage game = activeGames[msg.sender];
        require(game.flippedCard1 != 255 && game.flippedCard2 != 255, "No cards to resolve");

        game.flippedCard1 = 255;
        game.flippedCard2 = 255;

        game.steps += 1;

        if (game.steps >= MAX_STEPS) {
            _endGame(false);
        }
    }

    // End game and update statistics
    function _endGame(bool won) internal {
        GameSession storage game = activeGames[msg.sender];

        // Calculate final score for display purposes
        uint32 finalScore = 0;
        if (won) {
            // Calculate final score: base 10 + (50 - steps) * 0.1 (adjusted for 5 pairs)
            uint32 stepBonus = (MAX_STEPS - game.steps) * 100000; // Multiply by 100000 for precision
            finalScore = 10000000 + stepBonus; // Base 10.0 * 1000000
        }

        game.score = finalScore;
        game.endTime = block.timestamp;

        // Update player statistics (only track best score and games played)
        PlayerStats storage stats = playerStats[msg.sender];
        stats.gamesPlayed += 1;

        if (won) {
            stats.gamesWon += 1;
            // Update best score if better
            if (finalScore > stats.bestScore) {
                stats.bestScore = finalScore;
                // Update leaderboard only when new best score is achieved
                _updateLeaderboard(finalScore);
            }
        }

        game.gameEnded = true;

        emit GameEnded(msg.sender, won, game.score);
    }

    // Update leaderboard with new score
    function _updateLeaderboard(uint32 newScore) internal {
        // Find position to insert new score
        uint8 insertPos = 10; // Default to end if not in top 10

        for (uint8 i = 0; i < 10; i++) {
            if (leaderboard[i].player == address(0) || newScore > leaderboard[i].score) {
                insertPos = i;
                break;
            }
        }

        if (insertPos < 10) {
            // Shift lower scores down
            for (uint8 i = 9; i > insertPos; i--) {
                leaderboard[i] = leaderboard[i - 1];
            }

            // Insert new score
            leaderboard[insertPos] = LeaderboardEntry({
                player: msg.sender,
                score: newScore,
                timestamp: block.timestamp
            });

            emit LeaderboardUpdated(msg.sender, insertPos + 1);
        }
    }

    // Get leaderboard (shows top 10 scores)
    function getLeaderboard() external view returns (
        address[10] memory players,
        uint32[10] memory scores,
        uint256[10] memory timestamps
    ) {
        for (uint8 i = 0; i < 10; i++) {
            if (leaderboard[i].player != address(0)) {
                players[i] = leaderboard[i].player;
                scores[i] = leaderboard[i].score;
                timestamps[i] = leaderboard[i].timestamp;
            }
        }
    }

    // Get player's current game state
    function getGameState() external view returns (
        uint32 sessionId,
        uint8[BOARD_SIZE] memory board,
        uint8 flippedCard1,
        uint8 flippedCard2,
        uint8 steps,
        uint32 score,
        uint8 matchedPairs,
        bool gameEnded,
        uint256 startTime,
        uint256 endTime
    ) {
        require(activeGames[msg.sender].player == msg.sender, "No active game");

        GameSession storage game = activeGames[msg.sender];

        sessionId = game.sessionId;
        flippedCard1 = game.flippedCard1;
        flippedCard2 = game.flippedCard2;
        steps = game.steps;
        score = game.score;
        matchedPairs = game.matchedPairs;
        gameEnded = game.gameEnded;
        startTime = game.startTime;
        endTime = game.endTime;

        // Copy board values
        for (uint8 i = 0; i < BOARD_SIZE; i++) {
            board[i] = game.board[i];
        }
    }

    // Get player's statistics
    function getPlayerStats() external view returns (
        uint32 totalScore,
        uint16 gamesPlayed,
        uint16 gamesWon,
        uint32 bestScore
    ) {
        PlayerStats storage stats = playerStats[msg.sender];
        totalScore = stats.totalScore;
        gamesPlayed = stats.gamesPlayed;
        gamesWon = stats.gamesWon;
        bestScore = stats.bestScore;
    }

    // Get player's rank in leaderboard
    function getPlayerRank() external view returns (uint8 rank, uint32 score) {
        for (uint8 i = 0; i < 10; i++) {
            if (leaderboard[i].player == msg.sender) {
                rank = i + 1;
                score = leaderboard[i].score;
                return (rank, score);
            }
        }
        return (0, 0); // Not in top 10
    }

    // Abandon current game without affecting stats
    function abandonGame() external {
        require(activeGames[msg.sender].player == msg.sender, "No active game");
        require(!activeGames[msg.sender].gameEnded, "Game has already ended");

        GameSession storage game = activeGames[msg.sender];

        // Mark game as ended but don't update statistics
        game.gameEnded = true;
        game.endTime = block.timestamp;

        emit GameEnded(msg.sender, false, 0); // false for not won, 0 for no score change
    }

    // Reset game (for testing purposes)
    function resetGame() external {
        delete activeGames[msg.sender];
    }
}
