import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Gamepad2, Brain, Shield } from 'lucide-react';
import { GameBoard } from '../components/GameBoard';
import { GameStats } from '../components/GameStats';
import { Header } from '../components/Header';
import { useGameContract } from '../hooks/useGameContract';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const GamePage = () => {
  const { gameState, startGame, flipCard, resolveMatch, abandonGame, isLoading, error, pendingResolution } = useGameContract();
  const [isStarting, setIsStarting] = useState(false);

  const handleStartGame = async () => {
    setIsStarting(true);
    try {
      await startGame();
    } catch (err) {
      console.error('Failed to start game:', err);
    } finally {
      setIsStarting(false);
    }
  };

  const handleCardFlip = async (cardIndex: number) => {
    try {
      await flipCard(cardIndex);
    } catch (err) {
      console.error('Failed to flip card:', err);
    }
  };

  const handleAbandonGame = async () => {
    if (!window.confirm('Are you sure you want to abandon the current game? This will not affect your score.')) {
      return;
    }

    try {
      await abandonGame();
    } catch (err) {
      console.error('Failed to abandon game:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-red-950 to-green-900 relative overflow-hidden">
      {/* Snowflakes decoration */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="snowflake"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          >
            ❄
          </div>
        ))}
      </div>
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-4xl twinkle">🎄</span>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 bg-clip-text text-transparent">
              Encrypted Memory Match
            </h1>
            <span className="text-4xl twinkle">🎅</span>
          </div>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto mb-6">
            Challenge your memory in a fully encrypted card matching game.
            Your gameplay data stays private while competing on the leaderboard.
          </p>

          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="flex items-center gap-2 text-red-400">
              <Shield className="h-5 w-5" />
              <span>FHE Protected</span>
            </div>
            <div className="flex items-center gap-2 text-green-400">
              <Gamepad2 className="h-5 w-5" />
              <span>5 Pairs</span>
            </div>
            <div className="flex items-center gap-2 text-yellow-400">
              <Trophy className="h-5 w-5" />
              <span>Global Leaderboard</span>
            </div>
          </div>
        </div>

        {/* Game Area */}
        <div className="max-w-6xl mx-auto">
          {!gameState && (
            <Card className="bg-gradient-to-br from-red-900/60 to-green-900/60 border-red-500/50 shadow-lg glow-christmas">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-white flex items-center justify-center gap-2">
                  <span className="text-2xl">🎁</span>
                  Ready to Play?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-200 mb-6">
                  Start a new encrypted memory match game. Find all 5 pairs to win!
                </p>
                <Button
                  onClick={handleStartGame}
                  disabled={isLoading || isStarting}
                  className="bg-gradient-to-r from-red-600 to-green-600 hover:from-red-700 hover:to-green-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg"
                >
                  {isLoading || isStarting ? 'Starting Game...' : '🎮 Start New Game'}
                </Button>
              </CardContent>
            </Card>
          )}

          {gameState && (
            <div className="max-w-6xl mx-auto">
              {/* Title at top */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Memory Match Game</h2>
                <p className="text-gray-300 text-sm">
                  Find all 5 pairs to win!
                </p>
              </div>

              {/* Layout: Cards on left (70%), Stats on right (30%) */}
              <div className="grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-6">
                {/* Game Board - Left side (70%) */}
                <div className="order-1 flex flex-col justify-center">
                  <GameBoard
                    gameState={gameState}
                    onCardFlip={handleCardFlip}
                    onResolveMatch={resolveMatch}
                    onStartNewGame={handleStartGame}
                    isLoading={isLoading}
                    pendingResolution={pendingResolution}
                  />
                </div>

                {/* Game Stats - Right side (30%) */}
                <div className="order-2 flex flex-col">
                  <GameStats
                    gameState={gameState}
                    onAbandonGame={handleAbandonGame}
                    isLoading={isLoading}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard Link */}
          <div className="text-center mt-8">
            <Link to="/leaderboard">
              <Button variant="outline" className="border-yellow-500/50 text-yellow-300 hover:bg-yellow-900/30 hover:border-yellow-400">
                <Trophy className="h-4 w-4 mr-2" />
                View Leaderboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-2xl mx-auto mt-8">
            <Card className="bg-red-900/40 border-red-500 shadow-lg">
              <CardContent className="pt-6">
                <p className="text-red-200 text-center">{error}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default GamePage;
