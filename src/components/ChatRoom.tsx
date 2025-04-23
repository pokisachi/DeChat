import React, { useState, useEffect } from 'react';
import { ChatWindow } from './ChatWindow';
import { MessageInput } from './MessageInput';
import { IGunInstance } from 'gun/types'; // Import type của Gun
interface ChatViewProps {
  gun: IGunInstance<any>;
  account: string;
  currentChat: string;
}
export const ChatView: React.FC<ChatViewProps> = ({ gun, account, currentChat }) => {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (currentChat) {
      gun.get(currentChat)
        .get('messages')
        .map()
        .on((data, id) => {
          if (data) {
            setMessages(prev => {
              const exists = prev.some(msg => msg.id === id);
              if (!exists) {
                return [...prev, { ...data, id }];
              }
              return prev;
            });
          }
        });
    }
  }, [currentChat, gun]);

  const handleSendMessage = (text: string) => {
    if (currentChat && account) {
      gun.get(currentChat).get('messages').set({
        sender: account,
        text,
        timestamp: Date.now(),
        status: 'sent'
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ChatWindow messages={messages} currentUser={account} />
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
    };
