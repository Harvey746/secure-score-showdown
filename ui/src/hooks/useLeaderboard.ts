import { useState, useEffect, useCallback } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { CONTRACT_ADDRESSES, CONTRACT_ABI } from '../config/contracts';

export interface LeaderboardEntry {
  player: string;
  score: number;
  timestamp: number;
}

export interface PlayerRank {
  rank: number;
  score: number;
}

export const useLeaderboard = () => {
  const { address, isConnected, chain } = useAccount();
  const publicClient = usePublicClient();

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [playerRank, setPlayerRank] = useState<PlayerRank>({ rank: 0, score: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contractAddress = chain?.id === 31337
    ? CONTRACT_ADDRESSES.localhost
    : CONTRACT_ADDRESSES.sepolia;

  const getContract = useCallback(() => {
    if (!publicClient) return null;
    return {
      address: contractAddress as `0x${string}`,
      abi: CONTRACT_ABI,
    };
  }, [contractAddress, publicClient]);

  const refreshLeaderboard = useCallback(async () => {
    if (!publicClient) return;

    setIsLoading(true);
    setError(null);

    try {
      const contract = getContract();
      if (!contract) throw new Error('Contract not available');

      const result = await publicClient.readContract({
        ...contract,
        functionName: 'getLeaderboard',
        args: [],
      }) as unknown as any[];

      const [players, scores, timestamps] = result;

      const entries: LeaderboardEntry[] = [];
      for (let i = 0; i < players.length; i++) {
        if (players[i] !== '0x0000000000000000000000000000000000000000') {
          entries.push({
            player: players[i] as string,
            score: Number(scores[i]),
            timestamp: Number(timestamps[i]),
          });
        }
      }

      setLeaderboard(entries);
    } catch (err: any) {
      console.error('Failed to get leaderboard:', err);
      setError(err.message || 'Failed to load leaderboard');
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, getContract]);

  const refreshPlayerRank = useCallback(async () => {
    if (!address || !publicClient) {
      setPlayerRank({ rank: 0, score: 0 });
      return;
    }

    try {
      const contract = getContract();
      if (!contract) return;

      const result = await publicClient.readContract({
        ...contract,
        functionName: 'getPlayerRank',
        args: [],
        account: address,
      }) as unknown as any[];

      const [rank, score] = result;

      setPlayerRank({
        rank: Number(rank),
        score: Number(score),
      });
    } catch (err) {
      console.error('Failed to get player rank:', err);
      setPlayerRank({ rank: 0, score: 0 });
    }
  }, [address, publicClient, getContract]);

  useEffect(() => {
    if (isConnected) {
      refreshLeaderboard();
      refreshPlayerRank();
    }
  }, [isConnected, chain]);

  return {
    leaderboard,
    playerRank,
    refreshLeaderboard,
    refreshPlayerRank,
    isLoading,
    error,
  };
};


