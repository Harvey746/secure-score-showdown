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
  const [resolvingPair, setResolvingPair] = useState<string | null>(null);

  // Initialize card states
  useEffect(() => {
    const initialStates: CardState[] = gameState.board.map((value, _index) => ({
      value,
      isFlipped: false,
    }));
    setCardStates(initialStates);
    setMatchedCards(new Set()); // Reset matched cards for new game
    setLocalPendingResolution(false); // Reset pending resolution
    setResolvingPair(null); // Reset resolving pair
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

      if (gameState.flippedCard1 !== 255 && gameState.flippedCard1 < newStates.length && !matchedCards.has(gameState.flippedCard1)) {
        newStates[gameState.flippedCard1].isFlipped = true;
      }
      if (gameState.flippedCard2 !== 255 && gameState.flippedCard2 < newStates.length && !matchedCards.has(gameState.flippedCard2)) {
        newStates[gameState.flippedCard2].isFlipped = true;
      }

      matchedCards.forEach(cardIndex => {
        if (cardIndex < newStates.length) {
          newStates[cardIndex].isFlipped = true;
        }
      });

      return newStates;
    });
  }, [gameState.flippedCard1, gameState.flippedCard2, gameState.sessionId, matchedCards]);

  // Handle card resolution after both cards are flipped
  useEffect(() => {
    // Only process if both cards are flipped and we're not already resolving
    if (gameState.flippedCard1 !== 255 && gameState.flippedCard2 !== 255 && !localPendingResolution && !isLoading) {
      // Validate card indices
      if (gameState.flippedCard1 >= gameState.board.length || gameState.flippedCard2 >= gameState.board.length) {
        return;
      }

      // Don't process if cards are already matched
      if (matchedCards.has(gameState.flippedCard1) || matchedCards.has(gameState.flippedCard2)) {
        return;
      }

      // Create a unique key for this card pair to avoid duplicate processing
      const pairKey = `${Math.min(gameState.flippedCard1, gameState.flippedCard2)}-${Math.max(gameState.flippedCard1, gameState.flippedCard2)}`;
      if (resolvingPair === pairKey) {
        return; // Already processing this pair
      }

      setLocalPendingResolution(true);
      setResolvingPair(pairKey);

      const card1Value = gameState.board[gameState.flippedCard1];
      const card2Value = gameState.board[gameState.flippedCard2];
      const isMatch = card1Value === card2Value;
      const flippedCard1Index = gameState.flippedCard1;
      const flippedCard2Index = gameState.flippedCard2;

      const resolveCards = async () => {
        try {
          // If cards match, add them to matched cards before resolving
          if (isMatch) {
            setMatchedCards(prev => new Set([...prev, flippedCard1Index, flippedCard2Index]));
          }

          await onResolveMatch();
        } catch (error) {
          console.error('Error resolving match:', error);
        } finally {
          // Reset pending resolution after a delay to allow state to update
          setTimeout(() => {
            setLocalPendingResolution(false);
            setResolvingPair(null);
          }, 500);
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
  }, [gameState.flippedCard1, gameState.flippedCard2, gameState.board, gameState.sessionId, onResolveMatch, isLoading]);

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
    <Card className="p-6 bg-gradient-to-br from-red-900/60 to-green-900/60 border-yellow-500/50 shadow-lg glow-christmas">
      <div className="grid grid-cols-5 gap-4 justify-items-center mx-auto w-fit">
        {cardStates.map((card, index) => (
          <Button
            key={index}
            onClick={() => handleCardClick(index)}
            disabled={isLoading || gameState.gameEnded || matchedCards.has(index)}
            className={`
              h-20 w-20 p-0 text-3xl font-bold transition-all duration-300 transform
              ${matchedCards.has(index)
                ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/50 scale-105 ring-2 ring-green-400'
                : card.isFlipped
                ? 'bg-gradient-to-br from-red-500 to-yellow-500 text-white shadow-lg shadow-red-500/50 scale-105'
                : 'bg-gradient-to-br from-slate-700 to-slate-800 text-slate-300 hover:from-red-900 hover:to-green-900 hover:scale-105 hover:shadow-lg'
              }
              ${animatingCards.has(index) ? 'animate-pulse' : ''}
              ${isLoading || matchedCards.has(index) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
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
            className="bg-gradient-to-r from-red-600 to-green-600 hover:from-red-700 hover:to-green-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg"
          >
            {isLoading ? 'Starting...' : '🎮 Play Again'}
          </Button>
        </div>
      )}
    </Card>
  );
};

