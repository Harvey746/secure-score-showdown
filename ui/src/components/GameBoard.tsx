import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { GameState } from '../hooks/useGameContract';

interface GameBoardProps {
  gameState: GameState;
  onCardFlip: (cardIndex: number) => void;
  onResolveMatch: () => void;
  onStartNewGame: () => void;
  isLoading: boolean;
  pendingResolution: boolean;
}

interface CardState {
  value: number;
  isFlipped: boolean;
}

export const GameBoard = ({ gameState, onCardFlip, onResolveMatch, onStartNewGame, isLoading, pendingResolution }: GameBoardProps) => {
  const [cardStates, setCardStates] = useState<CardState[]>([]);
  const [animatingCards, setAnimatingCards] = useState<Set<number>>(new Set());
  const [localPendingResolution, setLocalPendingResolution] = useState(false);
  const [matchedCards, setMatchedCards] = useState<Set<number>>(new Set());

  // Initialize card states
  useEffect(() => {
    const initialStates: CardState[] = gameState.board.map((value, _index) => ({
      value,
      isFlipped: false,
    }));
    setCardStates(initialStates);
    setMatchedCards(new Set()); // Reset matched cards for new game
  }, [gameState.sessionId]); // Reset when new game starts

  useEffect(() => {
    setCardStates(prevStates => {
      const newStates = [...prevStates];
      newStates.forEach((state, index) => {
        if (!matchedCards.has(index)) {
          newStates[index] = {
            ...state,
            isFlipped: false
          };
        }
      });
      return newStates;
    });
  }, [gameState.sessionId]);

  // Handle card resolution after both cards are flipped
  useEffect(() => {
    if (gameState.flippedCard1 !== 255 && gameState.flippedCard2 !== 255 && !localPendingResolution) {
      // Two cards are flipped, start resolution process
      setLocalPendingResolution(true);

      // Check if they match by comparing values
      const card1Value = gameState.board[gameState.flippedCard1];
      const card2Value = gameState.board[gameState.flippedCard2];
      const isMatch = card1Value === card2Value;

      const resolveCards = async () => {
        try {
          // If cards match, add them to matched cards before resolving
          if (card1Value === card2Value) {
            setMatchedCards(prev => new Set([...prev, gameState.flippedCard1, gameState.flippedCard2]));
          }

          await onResolveMatch();
        } finally {
          setLocalPendingResolution(false);
        }
      };

      if (isMatch) {
        // Cards match - resolve after brief delay to show the match
        const timer = setTimeout(resolveCards, 500);
        return () => clearTimeout(timer);
      } else {
        // Cards don't match - wait 1 second then resolve
        const timer = setTimeout(resolveCards, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [gameState.flippedCard1, gameState.flippedCard2, gameState.board, onResolveMatch]);

  const handleCardClick = async (cardIndex: number) => {
    if (isLoading || gameState.gameEnded || pendingResolution || localPendingResolution) return;
    // Don't allow clicking cards that are already matched
    if (matchedCards.has(cardIndex)) return;
    // Don't allow clicking cards that are currently flipped
    if (cardStates[cardIndex]?.isFlipped) return;

    // Add animation
    setAnimatingCards(prev => new Set(prev).add(cardIndex));

    try {
      await onCardFlip(cardIndex);
    } finally {
      // Remove animation after a short delay
      setTimeout(() => {
        setAnimatingCards(prev => {
          const newSet = new Set(prev);
          newSet.delete(cardIndex);
          return newSet;
        });
      }, 300);
    }
  };

  const getCardSymbol = (value: number) => {
    // Simple emoji mapping for card values (5 pairs)
    const symbols = ['🎯', '🎪', '🎨', '🎭', '🌟'];
    return symbols[value] || '?';
  };

  if (cardStates.length === 0) {
    return (
      <Card className="p-8 bg-slate-800/50 border-slate-700">
        <div className="text-center text-gray-400">
          Loading game board...
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-slate-800/50 border-slate-700">
      <div className="mb-4 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Memory Match Game</h2>
        <p className="text-gray-300">
          Find all 5 pairs to win!
        </p>
      </div>

      <div className="grid grid-cols-5 gap-3 max-w-xl mx-auto">
        {cardStates.map((card, index) => (
          <Button
            key={index}
            onClick={() => handleCardClick(index)}
            disabled={isLoading || gameState.gameEnded || matchedCards.has(index)}
            className={`
              h-16 w-16 p-0 text-2xl font-bold transition-all duration-300 transform
              ${matchedCards.has(index)
                ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg scale-105 ring-2 ring-green-400'
                : card.isFlipped
                ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg scale-105'
                : 'bg-gradient-to-br from-slate-600 to-slate-700 text-slate-400 hover:from-slate-500 hover:to-slate-600 hover:scale-105'
              }
              ${animatingCards.has(index) ? 'animate-pulse' : ''}
              ${isLoading || matchedCards.has(index) ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {card.isFlipped ? getCardSymbol(card.value) : '?'}
          </Button>
        ))}
      </div>

      {gameState.gameEnded && (
        <div className="text-center mt-6 space-y-4">
          <div>
            <div className="text-2xl font-bold text-green-400 mb-2">
              🎉 Game Complete!
            </div>
            <div className="text-gray-300 mb-4">
              Final Score: {gameState.score.toFixed(2)} | Steps: {gameState.steps}
            </div>
          </div>
          <Button
            onClick={onStartNewGame}
            disabled={isLoading}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-lg"
          >
            {isLoading ? 'Starting...' : 'Play Again'}
          </Button>
        </div>
      )}
    </Card>
  );
};

