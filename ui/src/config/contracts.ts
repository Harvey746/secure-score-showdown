export const CONTRACT_ADDRESSES = {
  localhost: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  sepolia: import.meta.env.VITE_CONTRACT_ADDRESS_SEPOLIA || '',
};

export function getContractAddress(chainId: number): string {
  if (chainId === 31337) {
    return CONTRACT_ADDRESSES.localhost;
  } else if (chainId === 11155111) {
    return CONTRACT_ADDRESSES.sepolia;
  }
  return '';
}

export const CONTRACT_ABI = [
  {
    "inputs": [],
    "name": "startGame",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint8",
        "name": "cardIndex",
        "type": "uint8"
      },
      {
        "internalType": "bytes",
        "name": "inputProof",
        "type": "bytes"
      }
    ],
    "name": "flipCard",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "abandonGame",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "resolveMatch",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "resetGame",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getGameState",
    "outputs": [
      {
        "internalType": "uint32",
        "name": "sessionId",
        "type": "uint32"
      },
      {
        "internalType": "uint8[10]",
        "name": "board",
        "type": "uint8[10]"
      },
      {
        "internalType": "uint8",
        "name": "flippedCard1",
        "type": "uint8"
      },
      {
        "internalType": "uint8",
        "name": "flippedCard2",
        "type": "uint8"
      },
      {
        "internalType": "uint8",
        "name": "steps",
        "type": "uint8"
      },
      {
        "internalType": "uint32",
        "name": "score",
        "type": "uint32"
      },
      {
        "internalType": "uint8",
        "name": "matchedPairs",
        "type": "uint8"
      },
      {
        "internalType": "bool",
        "name": "gameEnded",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "startTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "endTime",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPlayerStats",
    "outputs": [
      {
        "internalType": "uint32",
        "name": "totalScore",
        "type": "uint32"
      },
      {
        "internalType": "uint16",
        "name": "gamesPlayed",
        "type": "uint16"
      },
      {
        "internalType": "uint16",
        "name": "gamesWon",
        "type": "uint16"
      },
      {
        "internalType": "uint32",
        "name": "bestScore",
        "type": "uint32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getLeaderboard",
    "outputs": [
      {
        "internalType": "address[10]",
        "name": "players",
        "type": "address[10]"
      },
      {
        "internalType": "uint32[10]",
        "name": "scores",
        "type": "uint32[10]"
      },
      {
        "internalType": "uint256[10]",
        "name": "timestamps",
        "type": "uint256[10]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPlayerRank",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "rank",
        "type": "uint8"
      },
      {
        "internalType": "uint32",
        "name": "score",
        "type": "uint32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "sessionId",
        "type": "uint256"
      }
    ],
    "name": "GameStarted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "cardIndex",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "cardValue",
        "type": "uint8"
      }
    ],
    "name": "CardFlipped",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "card1Index",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "card2Index",
        "type": "uint8"
      }
    ],
    "name": "CardsMatched",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "card1Index",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "card2Index",
        "type": "uint8"
      }
    ],
    "name": "CardsNotMatched",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "won",
        "type": "bool"
      },
      {
        "indexed": false,
        "internalType": "uint32",
        "name": "finalScore",
        "type": "uint32"
      }
    ],
    "name": "GameEnded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newRank",
        "type": "uint256"
      }
    ],
    "name": "LeaderboardUpdated",
    "type": "event"
  }
] as const;
