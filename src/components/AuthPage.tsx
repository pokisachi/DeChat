import { Lock, Mail } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React from 'react';

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-telegram-primary to-telegram-secondary flex items-center justify-center p-4">
      <div className="bg-white dark:bg-telegram-dark-bg rounded-2xl w-full max-w-md p-8 space-y-6 shadow-xl">
        <h1 className="text-3xl font-bold text-center text-telegram-primary">
          Welcome to DChat
        </h1>
        
        <div className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input 
              placeholder="Email/Username" 
              className="pl-10 h-12 rounded-lg"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="password"
              placeholder="Password"
              className="pl-10 h-12 rounded-lg"
            />
          </div>
        </div>

        <Button className="w-full h-12 bg-telegram-primary hover:bg-telegram-primary-dark rounded-lg text-white">
          Continue
        </Button>

        <div className="text-center space-y-2">
          <p className="text-gray-500 dark:text-telegram-dark-text">
            Or connect with
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" className="rounded-full p-3">
              <img src="/metamask-icon.svg" className="h-6 w-6" />
            </Button>
            <Button variant="outline" className="rounded-full p-3">
              <img src="/walletconnect-icon.svg" className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}