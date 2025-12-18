import { Link } from 'react-router-dom';
import { Trophy, Medal, Award, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Header } from '../components/Header';
import { useLeaderboard } from '../hooks/useLeaderboard';

const LeaderboardPage = () => {
  const { leaderboard, playerRank, isLoading, error } = useLeaderboard();

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-400" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-orange-600" />;
      default:
        return <span className="text-lg font-bold text-gray-400">#{rank}</span>;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/50 to-yellow-600/50 border-yellow-400/90 shadow-lg shadow-yellow-500/30';
      case 2:
        return 'bg-gradient-to-r from-red-500/40 to-red-600/40 border-red-400/80 shadow-lg shadow-red-500/20';
      case 3:
        return 'bg-gradient-to-r from-green-500/40 to-green-600/40 border-green-400/80 shadow-lg shadow-green-500/20';
      default:
        return 'bg-gradient-to-br from-red-900/60 to-green-900/60 border-yellow-500/40 shadow-md';
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
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-yellow-300 hover:text-yellow-200 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Game
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 bg-clip-text text-transparent flex items-center justify-center gap-2">
            <span className="twinkle">🎄</span>
            Global Leaderboard
            <span className="twinkle">🎅</span>
          </h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            Top players in the Encrypted Memory Match challenge.
            All scores are computed and stored with full homomorphic encryption.
          </p>
        </div>

        {/* Player's Rank */}
        {playerRank.rank > 0 && (
          <Card className="max-w-2xl mx-auto mb-8 bg-gradient-to-r from-red-500/40 to-green-500/40 border-yellow-500/80 shadow-lg shadow-yellow-500/30 glow-christmas">
            <CardContent className="pt-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                  <span>🎁</span>
                  Your Ranking
                </h2>
                <div className="flex items-center justify-center gap-4">
                  {getRankIcon(playerRank.rank)}
                  <div>
                    <div className="text-3xl font-bold text-yellow-400">
                      #{playerRank.rank}
                    </div>
                    <div className="text-lg text-gray-200">
                      Score: {playerRank.score.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leaderboard */}
        <Card className="max-w-4xl mx-auto bg-gradient-to-br from-red-900/80 to-green-900/80 border-yellow-500/50 shadow-xl glow-christmas">
          <CardHeader>
            <CardTitle className="text-2xl text-white text-center flex items-center justify-center gap-2">
              <span className="text-2xl">🏆</span>
              Top 10 Players
              <span className="text-2xl">⭐</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="text-gray-400">Loading leaderboard...</div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="text-red-400">{error}</div>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400">No games played yet. Be the first!</div>
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((entry, index) => (
                  entry.player !== '0x0000000000000000000000000000000000000000' && (
                    <div
                      key={entry.player}
                      className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all hover:scale-[1.02] hover:shadow-lg ${getRankStyle(index + 1)}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10">
                          {getRankIcon(index + 1)}
                        </div>
                        <div>
                          <div className="text-white font-semibold text-lg">
                            {entry.player.slice(0, 6)}...{entry.player.slice(-4)}
                          </div>
                          <div className="text-sm text-gray-300">
                            {new Date(entry.timestamp * 1000).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-yellow-400">
                          {entry.score.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-300">points</div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* How it works */}
        <Card className="max-w-4xl mx-auto mt-8 bg-gradient-to-br from-red-900/70 to-green-900/70 border-yellow-500/50 shadow-lg glow-christmas">
          <CardHeader>
            <CardTitle className="text-xl text-white text-center flex items-center justify-center gap-2">
              <span>🎄</span>
              Privacy-First Gaming
              <span>🎁</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl mb-2">🛡️</div>
                <h3 className="font-semibold text-white mb-1">Encrypted Gameplay</h3>
                <p className="text-sm text-gray-300">
                  All game data is encrypted using FHE. Your card values and game progress remain private.
                </p>
              </div>
              <div>
                <div className="text-3xl mb-2">⚡</div>
                <h3 className="font-semibold text-white mb-1">Secure Computation</h3>
                <p className="text-sm text-gray-300">
                  Score calculations and win conditions are computed homomorphically without revealing your data.
                </p>
              </div>
              <div>
                <div className="text-3xl mb-2">🏆</div>
                <h3 className="font-semibold text-white mb-1">Fair Competition</h3>
                <p className="text-sm text-gray-300">
                  Compete fairly on the global leaderboard while maintaining complete privacy.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default LeaderboardPage;


