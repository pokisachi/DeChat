import React, { useEffect, useRef, useState } from "react";
import { initGun } from "../utils/gun";
import { decryptMessage } from "../utils/crypto";
import MessageBubble from "./MessageBubble.tsx";
import GroupInfoModal from './GroupInfoModal.tsx';

interface Message {
  sender: string;
  text: string;
  timestamp: number;
  file?: string;
}

interface Props {
  currentUser: string;
  roomId: string;
  messages: Message[];
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  isGroup: boolean;
}

const gun = initGun();

export default function ChatWindow({ currentUser, roomId, messages, setMessages, isGroup }: Props) {
  const [pinnedMessages, setPinnedMessages] = useState<Message[]>([]);
  const [groupInfo, setGroupInfo] = useState<GroupData | null>(null);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isGroup) {
      gun.get('groups').get(roomId).on((data) => {
        if (data) setGroupInfo(data);
      });

      gun.get(roomId).get('pinned').map().on((data) => {
        if (data) setPinnedMessages(prev => [...prev, data]);
      });
    }

    return () => {
      if (isGroup) {
        gun.get('groups').get(roomId).off();
        gun.get(roomId).get('pinned').off();
      }
    };
    
  }, [roomId, isGroup]);
  

  const handlePinMessage = (message: Message) => {
    if (!isGroup || !groupInfo) return;
    
    const isAdmin = groupInfo.members.find(m => 
      m.address === currentUser && m.role === 'admin'
    );
    
    if (!isAdmin) {
      alert('Only admins can pin messages');
      return;
    }

    gun.get(roomId).get('pinned').set(message);
  };

  const handleDeleteMessage = async (message: any) => {
    if (message.sender !== currentUser) {
      return;
    }
    
    try {
      gun.get(roomId).get(message.timestamp.toString()).put(null);
      setMessages(prev => prev.filter(msg => msg.timestamp !== message.timestamp));
    } catch (err) {
      console.error("Error deleting message:", err);
    }
  };

  useEffect(() => {
    if (!roomId) return;
    
    // Load old messages
    gun.get(roomId).map().once((data, key) => {
      if (data && data.timestamp) {
        const secret = localStorage.getItem("secret")!;
        decryptMessage(data.text, secret).then(decryptedText => {
          setMessages(prev => {
            const exists = prev.some(m => m.timestamp === data.timestamp);
            if (exists) return prev;
            
            return [...prev, {
              ...data,
              text: decryptedText
            }].sort((a, b) => a.timestamp - b.timestamp);
          });
        });
      }
    });

    // Listen for new messages
    const listener = (data: any, key: string) => {
      if (data && data.timestamp) {
        const secret = localStorage.getItem("secret")!;
        decryptMessage(data.text, secret).then(decryptedText => {
          setMessages(prev => {
            const exists = prev.some(m => m.timestamp === data.timestamp);
            if (exists) return prev;
            
            return [...prev, {
              ...data,
              text: decryptedText
            }].sort((a, b) => a.timestamp - b.timestamp);
          });
        });
      }
    };

    gun.get(roomId).map().on(listener);

    return () => {
      gun.get(roomId).map().off();
    };
  }, [roomId]);

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      {/* Header with group info button */}
      <div className="bg-white border-b px-4 py-2 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Chat</h2>
        {isGroup && (
          <button
            onClick={() => setShowGroupInfo(true)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            ℹ️
          </button>
        )}
      </div>

      {/* Pinned Messages */}
      {isGroup && pinnedMessages.length > 0 && (
        <div className="bg-yellow-50 p-2 border-b">
          <div className="flex items-center">
            <span className="text-yellow-600 mr-2">📌</span>
            <div className="text-sm text-yellow-800">
              {pinnedMessages[pinnedMessages.length - 1].text}
            </div>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex flex-col h-screen">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 
          md:max-w-2xl md:mx-auto      // Desktop
          sm:max-w-full sm:px-2        // Mobile
        ">
          {messages.map((message) => (
            <MessageBubble
              key={message.timestamp}
              message={{
                file: null,
                id: message.timestamp.toString(),
                text: message.text,
                sender: message.sender,
                timestamp: message.timestamp,
                status: 'sent',
                ...(message.file && {
                  attachment: {
                    cid: message.file,
                    type: 'file',
                    name: 'attachment'
                  }
                })
              }}
              isCurrentUser={message.sender === currentUser}
              onPin={(message: { sender: string; text: string; timestamp: number; file?: string }) => handlePinMessage(message)}
              onDelete={handleDeleteMessage}
              isGroup={isGroup}
              groupInfo={groupInfo}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Group Info Modal */}
      {showGroupInfo && groupInfo && (
        <GroupInfoModal
          group={groupInfo}
          currentUser={currentUser}
          onClose={() => setShowGroupInfo(false)}
        />
      )}
    </div>
  );
}
