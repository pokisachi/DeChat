// src/types/web3.d.ts
import { MetaMaskInpageProvider } from "@metamask/providers";

declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider & {
      isConnected: () => boolean;
      chainId: string;
    };
  }
}
