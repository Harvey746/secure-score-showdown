// No React import needed for this component
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

  const handleStartGame = async () => {
    try {
      await startGame();
    } catch (err) {
      console.error('Failed to start game:', err);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="h-8 w-8 text-cyan-400" />
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Encrypted Memory Match
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-6">
            Challenge your memory in a fully encrypted card matching game.
            Your gameplay data stays private while competing on the leaderboard.
          </p>

          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="flex items-center gap-2 text-cyan-400">
              <Shield className="h-5 w-5" />
              <span>FHE Protected</span>
            </div>
            <div className="flex items-center gap-2 text-purple-400">
              <Gamepad2 className="h-5 w-5" />
              <span>36 Cards</span>
            </div>
            <div className="flex items-center gap-2 text-blue-400">
              <Trophy className="h-5 w-5" />
              <span>Global Leaderboard</span>
            </div>
          </div>
        </div>

        {/* Game Area */}
        <div className="max-w-6xl mx-auto">
          {!gameState && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-white">Ready to Play?</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-300 mb-6">
                  Start a new encrypted memory match game. Find all 18 pairs to win!
                </p>
                <Button
                  onClick={handleStartGame}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-lg"
                >
                  {isLoading ? 'Starting Game...' : 'Start New Game'}
                </Button>
              </CardContent>
            </Card>
          )}

          {gameState && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Game Board */}
              <div className="lg:col-span-2">
                <GameBoard
                  gameState={gameState}
                  onCardFlip={handleCardFlip}
                  onResolveMatch={resolveMatch}
                  onStartNewGame={handleStartGame}
                  isLoading={isLoading}
                  pendingResolution={pendingResolution}
                />
              </div>

              {/* Game Stats */}
              <div>
                <GameStats
                  gameState={gameState}
                  onAbandonGame={handleAbandonGame}
                  isLoading={isLoading}
                />
              </div>
            </div>
          )}

          {/* Leaderboard Link */}
          <div className="text-center mt-8">
            <Link to="/leaderboard">
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                <Trophy className="h-4 w-4 mr-2" />
                View Leaderboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-2xl mx-auto mt-8">
            <Card className="bg-red-900/20 border-red-700">
              <CardContent className="pt-6">
                <p className="text-red-400 text-center">{error}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default GamePage;
