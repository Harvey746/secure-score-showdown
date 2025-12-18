import { useState, useEffect, useCallback } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { CONTRACT_ADDRESSES, CONTRACT_ABI } from '../config/contracts';

export interface GameState {
  sessionId: number;
  board: number[];
  flippedCard1: number;
  flippedCard2: number;
  steps: number;
  score: number;
  matchedPairs: number;
  gameEnded: boolean;
  startTime: number;
  endTime: number;
}

export const useGameContract = () => {
  const { address, isConnected, chain } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [pendingResolution] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);

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

  const refreshGameState = useCallback(async () => {
    if (!address || !publicClient) return;

    try {
      const contract = getContract();
      if (!contract) return;

      const result = await publicClient.readContract({
        ...contract,
        functionName: 'getGameState',
        args: [],
        account: address,
      }) as unknown as any[];

      if (!result || result.length === 0) {
        setGameState(null);
        return;
      }

      if (!result || !Array.isArray(result) || result.length < 10) {
        console.log('Invalid game state result:', result);
        setGameState(null);
        return;
      }

      const [
        sessionId,
        board,
        flippedCard1,
        flippedCard2,
        steps,
        score,
        matchedPairs,
        gameEnded,
        startTime,
        endTime,
      ] = result;

      // Convert BigInt values to numbers and handle arrays properly
      const gameStateData: GameState = {
        sessionId: Number(sessionId || 0),
        board: Array.isArray(board) ? board.map((val: bigint) => Number(val || 0)) : [],
        flippedCard1: Number(flippedCard1 || 0),
        flippedCard2: Number(flippedCard2 || 0),
        steps: Number(steps || 0),
        score: Number(score || 0),
        matchedPairs: Number(matchedPairs || 0),
        gameEnded: Boolean(gameEnded),
        startTime: Number(startTime || 0),
        endTime: Number(endTime || 0),
      };

      setGameState(gameStateData);
      setLastRefreshTime(Date.now());
    } catch (err: any) {
      if (err?.message?.includes('No active game')) {
        setGameState(null);
        return;
      }
      const errorMessage = err?.message || 'Failed to get game state';
      setError(errorMessage);
      setGameState(null);
    }
  }, [address, publicClient, getContract]);

  const startGame = useCallback(async () => {
    if (!address || !walletClient || !publicClient) {
      setError('Wallet not connected');
      return;
    }

    setIsLoading(true);
    setError(null);

    const contract = getContract();
    if (!contract) {
      setError('Contract not available');
      setIsLoading(false);
      return;
    }

    try {
      // Try to start game
      const startResult = await publicClient.simulateContract({
        ...contract,
        functionName: 'startGame',
        args: [],
        account: address,
      });

      const hash = await walletClient.writeContract(startResult.request);
      await publicClient.waitForTransactionReceipt({ hash });

      // Small delay to ensure contract state is updated
      await new Promise(resolve => setTimeout(resolve, 100));

      console.log('Game started successfully, refreshing state...');

      // Refresh game state
      await refreshGameState();

      console.log('Game state refreshed after start');
    } catch (err: any) {
      // If game already in progress, try to abandon it first
      if (err?.message?.includes('Game already in progress')) {
        console.log('Game already in progress, trying to abandon first...');

        try {
          // Try to abandon the current game
          const abandonResult = await publicClient.simulateContract({
            ...contract,
            functionName: 'abandonGame',
            args: [],
            account: address,
          });

          const abandonHash = await walletClient.writeContract(abandonResult.request);
          await publicClient.waitForTransactionReceipt({ hash: abandonHash });

          // Now try to start the game again
          const startResult = await publicClient.simulateContract({
            ...contract,
            functionName: 'startGame',
            args: [],
            account: address,
          });

          const hash = await walletClient.writeContract(startResult.request);
          await publicClient.waitForTransactionReceipt({ hash });

          // Small delay to ensure contract state is updated
          await new Promise(resolve => setTimeout(resolve, 100));

          console.log('Game started successfully after abandoning previous game');

          // Refresh game state
          await refreshGameState();

        } catch (abandonErr: any) {
          // If abandon failed (e.g., game already ended), try resetGame
          console.log('Abandon failed, trying reset...');
          try {
            const resetResult = await publicClient.simulateContract({
              ...contract,
              functionName: 'resetGame',
              args: [],
              account: address,
            });

            if (resetResult && resetResult.request) {
              const resetHash = await walletClient.writeContract(resetResult.request);
              if (resetHash) {
                await publicClient.waitForTransactionReceipt({ hash: resetHash });
              }
            }

            // Now try to start the game again
            const startResult = await publicClient.simulateContract({
              ...contract,
              functionName: 'startGame',
              args: [],
              account: address,
            });

            const hash = await walletClient.writeContract(startResult.request);
            await publicClient.waitForTransactionReceipt({ hash });

            // Small delay to ensure contract state is updated
            await new Promise(resolve => setTimeout(resolve, 100));

            console.log('Game started successfully after resetting');

            // Refresh game state
            await refreshGameState();

          } catch (resetErr: any) {
            console.error('Failed to reset game:', resetErr);
            setError('Unable to start new game. Please refresh the page and try again.');
          }
        }
      } else {
        console.error('Failed to start game:', err);
        setError(err.message || 'Failed to start game');
      }
    } finally {
      setIsLoading(false);
    }
  }, [address, walletClient, publicClient, getContract, refreshGameState]);

  const flipCard = useCallback(async (cardIndex: number) => {
    if (!address || !walletClient || !publicClient) {
      setError('Wallet not connected');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const contract = getContract();
      if (!contract) throw new Error('Contract not available');

      const flipResult = await publicClient.simulateContract({
        ...contract,
        functionName: 'flipCard',
        args: [cardIndex, '0x'], // cardIndex and empty inputProof for local testing
        account: address,
      });

      const hash = await walletClient.writeContract(flipResult.request);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status === 'success') {
        await refreshGameState();
      } else {
        throw new Error('Transaction failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to flip card');
    } finally {
      setIsLoading(false);
    }
  }, [address, walletClient, publicClient, getContract, refreshGameState]);

  const resolveMatch = useCallback(async () => {
    if (!address || !walletClient || !publicClient) {
      setError('Wallet not connected');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const contract = getContract();
      if (!contract) throw new Error('Contract not available');

      const resolveResult = await publicClient.simulateContract({
        ...contract,
        functionName: 'resolveMatch',
        args: [],
        account: address,
      });

      const hash = await walletClient.writeContract(resolveResult.request);
      await publicClient.waitForTransactionReceipt({ hash });

      // Small delay to ensure contract state is updated
      await new Promise(resolve => setTimeout(resolve, 100));

      // Refresh game state after resolution
      await refreshGameState();
    } catch (err: any) {
      console.error('Failed to resolve match:', err);
      setError(err.message || 'Failed to resolve match');
    } finally {
      setIsLoading(false);
    }
  }, [address, walletClient, publicClient, getContract, refreshGameState]);

  const abandonGame = useCallback(async () => {
    if (!address || !walletClient || !publicClient) {
      setError('Wallet not connected');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const contract = getContract();
      if (!contract) throw new Error('Contract not available');

      const abandonResult = await publicClient.simulateContract({
        ...contract,
        functionName: 'abandonGame',
        args: [],
        account: address,
      });

      const hash = await walletClient.writeContract(abandonResult.request);
      await publicClient.waitForTransactionReceipt({ hash });

      // Refresh game state after abandoning
      await refreshGameState();
    } catch (err: any) {
      console.error('Failed to abandon game:', err);
      setError(err.message || 'Failed to abandon game');
    } finally {
      setIsLoading(false);
    }
  }, [address, walletClient, publicClient, getContract, refreshGameState]);

  useEffect(() => {
    if (isConnected && address) {
      refreshGameState();
      const interval = setInterval(() => {
        refreshGameState();
      }, 5000);
      return () => clearInterval(interval);
    } else {
      setGameState(null);
    }
  }, [isConnected, address, chain, refreshGameState]);

  return {
    gameState,
    startGame,
    flipCard,
    resolveMatch,
    abandonGame,
    refreshGameState,
    isLoading,
    error,
    pendingResolution,
  };
};
