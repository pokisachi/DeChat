import { Lock, Mail, Loader2 } from 'lucide-react';
import { Button } from "@components/ui/button"
import { Input } from "@/components/ui/Input";
import React, { useState } from 'react';
import { ethers } from 'ethers';

interface AuthPageProps {
  setAccount: (account: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ setAccount }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [isEmailLogin, setIsEmailLogin] = useState(true);
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });

  const connectWallet = async () => {
    setIsConnecting(true);
    setError('');
    
    try {
      if (!window.ethereum && !isEmailLogin) {
        throw new Error('Vui lòng cài ví tiền điện tử');
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);
    } catch (err: any) {
      setError(err.message || 'Kết nối ví thất bại');
    } finally {
      setIsConnecting(false);
    }
  };

  const connectWalletConnect = async () => {
    // Triển khai logic WalletConnect tại đây
    setError('Tính năng đang phát triển');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Xử lý logic đăng nhập bằng email
    if (!credentials.email || !credentials.password) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-telegram-primary to-telegram-primary-dark flex items-center justify-center p-4">
      <div className="bg-white dark:bg-telegram-dark-bg rounded-2xl w-full max-w-md p-8 space-y-6 shadow-xl animate-fade-in">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-telegram-primary dark:text-white">
            Welcome to DChat
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {isEmailLogin ? 'Đăng nhập bằng email hoặc tên người dùng' : 'Kết nối ví để bắt đầu trò chuyện'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 p-4 rounded-lg text-sm animate-fade-in">
            {error}
          </div>
        )}
        
        {isEmailLogin ? (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input 
                placeholder="Email/Tên người dùng"
                value={credentials.email}
                onChange={(e: { target: { value: any; }; }) => setCredentials({...credentials, email: e.target.value})}
                className="pl-10 h-12 rounded-lg 
                  dark:border-gray-700 
                  dark:bg-telegram-dark-input 
                  dark:text-white
                  dark:placeholder-gray-400"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="password"
                placeholder="Mật khẩu"
                value={credentials.password}
                onChange={(e: { target: { value: any; }; }) => setCredentials({...credentials, password: e.target.value})}
                className="pl-10 h-12 rounded-lg 
                  dark:border-gray-700 
                  dark:bg-telegram-dark-input 
                  dark:text-white
                  dark:placeholder-gray-400"
              />
            </div>

            <Button 
              type="submit"
              className="w-full h-12 bg-telegram-primary hover:bg-telegram-primary-dark text-white rounded-lg"
            >
              Đăng nhập
            </Button>
          </form>
        ) : null}

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-telegram-dark-bg text-gray-500">
              {isEmailLogin ? 'Hoặc kết nối với' : 'Chọn ví của bạn'}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            variant="outline"
            className="w-full h-12 flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-telegram-dark-hover"
            onClick={connectWallet}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <img src="/metamask-icon.svg" className="h-5 w-5" alt="MetaMask" />
            )}
            <span className="dark:text-white">
              {isConnecting ? 'Đang kết nối...' : 'MetaMask'}
            </span>
          </Button>

          <Button
            variant="outline"
            className="w-full h-12 flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-telegram-dark-hover"
            onClick={connectWalletConnect}
          >
            <img src="/walletconnect-icon.svg" className="h-5 w-5" alt="WalletConnect" />
            <span className="dark:text-white">WalletConnect</span>
          </Button>
        </div>

        <div className="text-center">
          <button
            onClick={() => setIsEmailLogin(!isEmailLogin)}
            className="text-telegram-primary hover:text-telegram-primary-dark dark:text-telegram-dark-text text-sm"
          >
            {isEmailLogin ? 'Dùng ví thay thế' : 'Dùng email thay thế'}
          </button>
        </div>
      </div>
    </div>
  );
}