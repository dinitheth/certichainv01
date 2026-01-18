import { createConfig, http } from 'wagmi';
import { polygonAmoy } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import { QueryClient } from '@tanstack/react-query';

export const config = createConfig({
  chains: [polygonAmoy],
  connectors: [
    injected(), // Handles MetaMask, OKX, and other EIP-1193 wallets
  ],
  transports: {
    [polygonAmoy.id]: http(),
  },
});

export const queryClient = new QueryClient();