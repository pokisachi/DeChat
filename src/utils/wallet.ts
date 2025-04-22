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
    // 1. Tạo salt từ email
    const salt = ethers.keccak256(ethers.toUtf8Bytes(email));

    // 2. Dẫn xuất khóa bằng Argon2id
    const hash = await argon2id({
      pass: password,
      salt: salt,
      opts: {
        time: 3, // Số lượng vòng lặp (tăng để bảo mật hơn, nhưng chậm hơn)
        mem: 4096, // Dung lượng bộ nhớ (KB)
        hashLen: 32, // Độ dài của hash đầu ra (32 byte = 256 bit)
        // parallelization factor is fixed to 1 in browser
      }
    });

    // 3. Sử dụng khóa dẫn xuất để tạo ví một cách xác định
    const privateKey = ethers.keccak256(hash.encoded); // Hash lại để đảm bảo
    const wallet = new ethers.Wallet(privateKey.slice(2)); // Loại bỏ "0x"

    // 4. Tạo secret (có thể đơn giản là hash của private key)
    const secret = ethers.keccak256(ethers.toUtf8Bytes(privateKey));

    return {
      wallet: wallet,
      secret: secret
    };
  } catch (error) {
    console.error('Error creating wallet:', error);
    throw error;
  }
};
