import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { GameState } from '../hooks/useGameContract';
import { Clock, Target, Trophy, Zap, X } from 'lucide-react';

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

  return (
    <div className="space-y-4">
      {/* Game Progress */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-cyan-400" />
            Game Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Pairs Found</span>
              <span className="text-cyan-400 font-semibold">
                {gameState.matchedPairs}/{maxPairs}
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full transition-all duration-300"
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
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-400" />
            Current Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-1">
              {gameState.score.toFixed(2)}
            </div>
            <div className="text-sm text-gray-400">
              Base: 10.00 + Step Bonus
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Time */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-400" />
            Game Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            {gameState.endTime > 0 ? (
              <div>
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {Math.floor((gameState.endTime - gameState.startTime) / 60)}:
                  {((gameState.endTime - gameState.startTime) % 60).toString().padStart(2, '0')}
                </div>
                <div className="text-sm text-gray-400">Game Duration</div>
              </div>
            ) : gameState.startTime > 0 ? (
              <div>
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {Math.floor((Date.now() / 1000 - gameState.startTime) / 60)}:
                  {((Date.now() / 1000 - gameState.startTime) % 60).toString().padStart(2, '0')}
                </div>
                <div className="text-sm text-gray-400">Elapsed Time</div>
              </div>
            ) : (
              <div className="text-gray-400">Not started</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Game Status */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-400" />
            Game Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Status:</span>
              <span className={`font-semibold ${
                gameState.gameEnded
                  ? gameState.matchedPairs >= maxPairs
                    ? 'text-green-400'
                    : 'text-red-400'
                  : 'text-blue-400'
              }`}>
                {gameState.gameEnded
                  ? (gameState.matchedPairs >= maxPairs ? 'Won!' : 'Lost')
                  : 'In Progress'
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Session ID:</span>
              <span className="text-cyan-400 font-mono text-sm">
                {gameState.sessionId.toString().slice(0, 8)}...
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Abandon Game Button */}
      {!gameState.gameEnded && (
        <Card className="bg-slate-800/50 border-slate-700">
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

