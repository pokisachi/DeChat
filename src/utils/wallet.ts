/// <reference path="../types/argon2-browser.d.ts" />
import { ethers } from 'ethers';
import { argon2id } from 'argon2-browser';

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
      const provider = new ethers.providers.Web3Provider(window.ethereum);
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
    const salt = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(email));
    const hash = await argon2id({
      pass: password,
      salt: salt,
      opts: {
        time: 3,
        mem: 4096,
        hashLen: 32,
      }
    });

    // 3. Sử dụng khóa dẫn xuất để tạo ví một cách xác định
    const privateKey = ethers.utils.keccak256(hash.encoded); // Hash lại để đảm bảo
    const wallet = new ethers.Wallet(privateKey.slice(2)); // Loại bỏ "0x"

    // 4. Tạo secret (có thể đơn giản là hash của private key)
    const secret = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(privateKey));

    return {
      wallet: wallet,
      secret: secret
    };
  } catch (error) {
    console.error('Error creating wallet:', error);
    throw error;
  }
};
