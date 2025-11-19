import { getPublicKey, getPublicKeySignature } from '@fhevmjs/sdk';
import { ethers } from 'ethers';

export interface FhevmDecryptionSignature {
  publicKey: string;
  signature: string;
}

export async function loadOrSign(
  provider: ethers.Provider,
  signer: ethers.Signer,
  contractAddress: string
): Promise<FhevmDecryptionSignature | null> {
  try {
    const address = await signer.getAddress();
    const storageKey = `fhevm_${address}_${contractAddress}`;
    
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.publicKey && parsed.signature) {
        return {
          publicKey: parsed.publicKey,
          signature: parsed.signature
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Failed to load or sign FHE decryption signature:', error);
    return null;
  }
}

export async function saveDecryptionSignature(
  address: string,
  contractAddress: string,
  signature: FhevmDecryptionSignature
): Promise<void> {
  try {
    const storageKey = `fhevm_${address}_${contractAddress}`;
    localStorage.setItem(storageKey, JSON.stringify(signature));
  } catch (error) {
    console.error('Failed to save decryption signature:', error);
  }
}

