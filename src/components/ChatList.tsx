import React, { useEffect } from 'react';
import { Avatar, AvatarFallback } from '@radix-ui/react-avatar';
import { Search, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";

interface Props {
  selectedChat: string;
  onChatSelect: (chatId: string) => void;
}

const ChatList: React.FC<Props> = ({ selectedChat, onChatSelect }) => {
  useEffect(() => {
    console.log('ChatList mounted');
    console.log('Current selected chat:', selectedChat);
    
    return () => {
      console.log('ChatList unmounted');
    };
  }, [selectedChat]);

  const handleChatSelect = (chatId: string) => {
    console.log('Selecting chat:', chatId);
    onChatSelect(chatId);
  };

  return (
    <div className="w-80 border-r bg-white dark:bg-telegram-dark-bg">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold dark:text-telegram-dark-text">Chats</h2>
          <Button variant="ghost" size="icon">
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search"
            className="pl-10 rounded-full bg-gray-100 dark:bg-telegram-dark-input dark:text-telegram-dark-text"
          />
        </div>

        {/* Chat List */}
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i}
              onClick={() => handleChatSelect(`chat_${i}`)}
              className={`flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200
                ${selectedChat === `chat_${i}` 
                  ? 'bg-blue-100 dark:bg-telegram-dark-hover' 
                  : 'hover:bg-gray-100 dark:hover:bg-telegram-dark-hover'
                }`}
            >
              <Avatar className="h-12 w-12 rounded-full">
                <AvatarFallback className="bg-telegram-primary text-white">
                  U{i+1}
                </AvatarFallback>
              </Avatar>
              <div className="ml-3 flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <h3 className={`font-semibold truncate dark:text-telegram-dark-text
                    ${selectedChat === `chat_${i}` ? 'text-telegram-primary' : ''}`}>
                    User {i+1}
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex items-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    Last message preview...
                  </p>
                  {selectedChat === `chat_${i}` && (
                    <span className="ml-2 w-2 h-2 bg-telegram-primary rounded-full"/>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatList;  
