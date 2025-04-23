//chatWindow.tsx
import React from 'react';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: number;
}

interface ChatWindowProps {
  messages: Message[];
  currentUser: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, currentUser }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${
            message.sender === currentUser ? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl rounded-lg px-4 py-2 ${
              message.sender === currentUser
                ? 'bg-blue-100 text-gray-900' // Blue-ish background for current user
                : 'bg-gray-200 text-gray-900' // Light gray background for others
            }`}
          >
            <div className="text-sm">{message.content}</div>
            <div className="text-xs mt-1 text-gray-600">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};


