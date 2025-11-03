import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';
import { defineChain } from 'viem';

// Define localhost chain with correct configuration
const localhostChain = defineChain({
  id: 31337,
  name: 'Localhost',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Localhost Explorer',
      url: 'http://localhost:8545',
    },
  },
  testnet: true,
});

export const config = getDefaultConfig({
  appName: 'Encrypted Memory Match',
  projectId: 'demo-project-id-for-local-testing',
  chains: [localhostChain, sepolia],
  ssr: false,
});
