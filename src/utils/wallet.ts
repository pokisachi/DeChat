import { ethers } from 'ethers';

export interface WalletProvider {
  name: string;
  checkInstalled: () => boolean;
  connect: () => Promise<string>;
  sign: (message: string) => Promise<string>;
}

const metamaskProvider: WalletProvider = {
  name: 'MetaMask',
  checkInstalled: () => {
    if (typeof window === 'undefined') return false;
    return Boolean(window.ethereum?.isMetaMask);
  },
  connect: async () => {
    if (!window.ethereum?.isMetaMask) {
      throw new Error("MetaMask not installed");
    }

    try {
      // Request account access trực tiếp qua window.ethereum
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Lấy địa chỉ đầu tiên
      const address = accounts[0];
      console.log("Connected to address:", address); // Debug log
      
      return address;
    } catch (error) {
      console.error('MetaMask connection error:', error);
      throw error;
    }
  },
  sign: async (message: string) => {
    if (!window.ethereum?.isMetaMask) {
      throw new Error("MetaMask not installed");
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(message);
      return signature;
    } catch (error) {
      console.error('MetaMask signing error:', error);
      throw error;
    }
  }
};

export const providers = [metamaskProvider];

export const createWalletFromEmail = async (email: string, password: string) => {
  try {
    const wallet = ethers.Wallet.createRandom();
    return wallet;
  } catch (error) {
    console.error('Error creating wallet:', error);
    throw error;
  }
};


