import { useState, useEffect, useCallback } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { loadOrSign, saveDecryptionSignature, FhevmDecryptionSignature } from './FhevmDecryptionSignature';
import { ethers } from 'ethers';

export interface FhevmState {
  isReady: boolean;
  decryptionSignature: FhevmDecryptionSignature | null;
  error: string | null;
}

export const useFhevm = (contractAddress: string) => {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [state, setState] = useState<FhevmState>({
    isReady: false,
    decryptionSignature: null,
    error: null
  });

  const initializeFhevm = useCallback(async () => {
    if (!isConnected || !address || !publicClient || !walletClient) {
      setState(prev => ({ ...prev, isReady: false, error: 'Wallet not connected' }));
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(walletClient as any);
      const signer = await provider.getSigner();
      
      const signature = await loadOrSign(provider, signer, contractAddress);
      
      if (signature) {
        setState({
          isReady: true,
          decryptionSignature: signature,
          error: null
        });
      } else {
        setState({
          isReady: false,
          decryptionSignature: null,
          error: 'Failed to initialize FHE decryption signature'
        });
      }
    } catch (error: any) {
      setState({
        isReady: false,
        decryptionSignature: null,
        error: error.message || 'Failed to initialize FHE'
      });
    }
  }, [isConnected, address, publicClient, walletClient, contractAddress]);

  useEffect(() => {
    if (isConnected && address) {
      initializeFhevm();
    } else {
      setState({
        isReady: false,
        decryptionSignature: null,
        error: null
      });
    }
  }, [isConnected, address, initializeFhevm]);

  return {
    ...state,
    initializeFhevm
  };
};

