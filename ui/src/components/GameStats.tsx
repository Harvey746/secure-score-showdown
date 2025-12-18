import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { GameState } from '../hooks/useGameContract';
import { Clock, Target, Trophy, X } from 'lucide-react';

interface GameStatsProps {
  gameState: GameState;
  onAbandonGame: () => void;
  isLoading: boolean;
}

export const GameStats = ({ gameState, onAbandonGame, isLoading }: GameStatsProps) => {
  const maxPairs = 5; // 5 pairs in the current game
  const maxSteps = 50; // Adjusted for 5 pairs
  const progressPercentage = (gameState.matchedPairs / maxPairs) * 100;
  const stepsRemaining = Math.max(0, maxSteps - gameState.steps);
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));

  // Update current time every second
  useEffect(() => {
    if (gameState.startTime > 0 && !gameState.gameEnded) {
      const interval = setInterval(() => {
        setCurrentTime(Math.floor(Date.now() / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState.startTime, gameState.gameEnded]);

  // Format time in MM:SS format
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-3">
      {/* Game Progress */}
      <Card className="bg-gradient-to-br from-red-900/70 to-green-900/70 border-yellow-500/50 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-red-400" />
            Game Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Pairs Found</span>
              <span className="text-green-400 font-semibold">
                {gameState.matchedPairs}/{maxPairs}
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-red-500 to-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {gameState.steps}
              </div>
              <div className="text-gray-400">Steps Taken</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {stepsRemaining > 0 ? stepsRemaining : 0}
              </div>
              <div className="text-gray-400">Steps Left</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Score */}
      <Card className="bg-gradient-to-br from-red-900/70 to-green-900/70 border-yellow-500/50 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-400" />
            Current Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              {(gameState.score / 1000000).toFixed(2)}
            </div>
            <div className="text-xs text-gray-400">
              Base: 10.00 + Step Bonus
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Time */}
      <Card className="bg-gradient-to-br from-red-900/70 to-green-900/70 border-yellow-500/50 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-400" />
            Game Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            {gameState.endTime > 0 ? (
              <div>
                <div className="text-2xl font-bold text-yellow-400 mb-1">
                  {formatTime(gameState.endTime - gameState.startTime)}
                </div>
                <div className="text-xs text-gray-400">Game Duration</div>
              </div>
            ) : gameState.startTime > 0 ? (
              <div>
                <div className="text-2xl font-bold text-yellow-400 mb-1">
                  {formatTime(currentTime - gameState.startTime)}
                </div>
                <div className="text-xs text-gray-400">Elapsed Time</div>
              </div>
            ) : (
              <div className="text-gray-400 text-sm">Not started</div>
            )}
          </div>
        </CardContent>
      </Card>

      {gameState.gameEnded && (
        <Card className="bg-gradient-to-br from-red-900/70 to-green-900/70 border-yellow-500/50 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-400" />
              Final Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Final Score:</span>
                <span className="text-2xl font-bold text-yellow-400">
                  {(gameState.score / 1000000).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Result:</span>
                <span className={`font-semibold ${
                  gameState.matchedPairs >= maxPairs ? 'text-green-400' : 'text-red-400'
                }`}>
                  {gameState.matchedPairs >= maxPairs ? 'Victory!' : 'Game Over'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Pairs Matched:</span>
                <span className="text-cyan-400 font-semibold">
                  {gameState.matchedPairs}/{maxPairs}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!gameState.gameEnded && (
        <Card className="bg-gradient-to-br from-red-900/70 to-green-900/70 border-yellow-500/50 shadow-lg">
          <CardContent className="pt-6">
            <Button
              onClick={onAbandonGame}
              disabled={isLoading}
              variant="outline"
              className="w-full border-red-600 text-red-400 hover:bg-red-900/20 hover:border-red-500 disabled:opacity-50"
            >
              <X className="h-4 w-4 mr-2" />
              {isLoading ? 'Abandoning...' : 'Abandon Game'}
            </Button>
            <p className="text-xs text-gray-400 text-center mt-2">
              Abandoning won't affect your score
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

