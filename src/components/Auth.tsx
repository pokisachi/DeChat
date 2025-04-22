import React, { useState, useEffect } from "react";
import { ethers } from 'ethers';
import { providers, createWalletFromEmail, WalletProvider } from '../utils/wallet';

type Props = {
  account: string;
  setAccount: (v: string) => void;
};

export default function Auth({ account, setAccount }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isEmailLogin, setIsEmailLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if there's a cached account
    const cachedAccount = localStorage.getItem("account");
    if (cachedAccount) {
      setAccount(cachedAccount);
    }
  }, [setAccount]);

  const connectWallet = async (provider: WalletProvider) => {
    setIsLoading(true);
    try {
      if (!provider.checkInstalled()) {
        alert(`Please install ${provider.name} first`);
        return;
      }

      // Lấy địa chỉ ví
      const address = await provider.connect();
      console.log("Connected address:", address); // Debug log

      // Yêu cầu ký message để xác thực
      const message = `Sign this message to authenticate with DeChat at ${Date.now()}`;
      const signature = await provider.sign(message);
      console.log("Signature received:", signature); // Debug log
      
      const secret = ethers.keccak256(
        ethers.toUtf8Bytes(signature)
      );
      
      // Lưu vào localStorage
      localStorage.setItem("account", address);
      localStorage.setItem("secret", secret);
      
      // Cập nhật state
      setAccount(address);
      
    } catch (error) {
      console.error('Authentication error:', error);
      setIsLoading(false); // Reset loading state on error
      if ((error as Error).message.includes('user rejected')) {
        alert('You rejected the connection request');
      } else {
        alert(`Could not connect to ${provider.name}. Please try again.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const wallet = await createWalletFromEmail(email, password);
      localStorage.setItem("account", wallet.address);
      setAccount(wallet.address);
    } catch (error) {
      console.error('Email login error:', error);
      alert('Could not login with email: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to DeChat
          </h2>
        </div>

        {isLoading ? (
          <div className="text-center">
            <div className="spinner">Loading...</div>
          </div>
        ) : isEmailLogin ? (
          <form className="mt-8 space-y-6" onSubmit={handleEmailLogin}>
            <input type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="appearance-none rounded-none relative block w-full px-3 py-2 border"
              disabled={isLoading}
            />
            <input type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="appearance-none rounded-none relative block w-full px-3 py-2 border"
              disabled={isLoading}
            />
            <button type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              disabled={isLoading}
            >
              Sign in with Email
            </button>
          </form>
        ) : (
          <div className="mt-8 space-y-6">
            {providers.map(provider => (
              <button
                key={provider.name}
                onClick={() => connectWallet(provider)}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                disabled={isLoading}
              >
                Connect with {provider.name}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => setIsEmailLogin(!isEmailLogin)}
          className="text-sm text-indigo-600 hover:text-indigo-500"
          disabled={isLoading}
        >
          {isEmailLogin ? 'Connect with Wallet instead' : 'Sign in with Email instead'}
        </button>
      </div>
    </div>
  );
}
