
import React from 'react';

import { Search, Plus, Send, Check } from 'lucide-react'; // Thêm Check icon
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import { Button } from "@/components/ui/button"; // Import chính xác
import { Input } from "@/components/ui/input"; // Thêm Input component




export default function ChatLayout() {
  return (
    <div className="flex h-screen bg-telegram-bg dark:bg-telegram-dark-bg">
      {/* Left Sidebar */}
      <div className="w-80 border-r bg-white dark:bg-telegram-dark-bg">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Chats</h2>
            <Button variant="ghost" size="icon">
              <Plus className="h-5 w-5" />
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search"
              className="pl-10 rounded-full bg-gray-100 dark:bg-telegram-dark-input"
            />
          </div>

          {/* Chat List */}
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i}
                className="flex items-center p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-telegram-dark-hover cursor-pointer"
              >
                <Avatar className="h-12 w-12">
                  <AvatarFallback>U{i+1}</AvatarFallback>
                </Avatar>
                <div className="ml-3 flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">User {i+1}</h3>
                    <span className="text-sm text-gray-500">10:30 AM</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    Last message preview...
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b flex items-center bg-white dark:bg-telegram-dark-bg">
          <Avatar className="h-10 w-10">
            <AvatarFallback>U1</AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <h2 className="font-semibold">John Doe</h2>
            <p className="text-sm text-gray-500">last seen recently</p>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-telegram-message-bg dark:bg-telegram-dark-message-bg">
          {/* Message Bubble */}
          <div className="flex justify-end">
            <div className="max-w-[70%] bg-telegram-primary text-white p-3 rounded-xl rounded-br-none">
              <p>Hello! This is a sent message</p>
              <div className="flex items-center justify-end space-x-1 mt-2">
                <span className="text-xs opacity-70">10:30 AM</span>
                <Check className="h-3 w-3" />
              </div>
            </div>
          </div>

          <div className="flex justify-start">
            <div className="max-w-[70%] bg-white dark:bg-telegram-dark-message p-3 rounded-xl rounded-bl-none">
              <p>Hi! This is a received message</p>
              <span className="text-xs text-gray-500 mt-2 block">10:31 AM</span>
            </div>
          </div>
        </div>

        {/* Message Input */}
        <div className="p-4 border-t bg-white dark:bg-telegram-dark-bg">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Plus className="h-5 w-5" />
            </Button>
            <Input 
              placeholder="Type a message"
              className="flex-1 rounded-full py-6 bg-gray-100 dark:bg-telegram-dark-input"
            />
            <Button className="rounded-full w-12 h-12 bg-telegram-primary">
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
