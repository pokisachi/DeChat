//MessageBubble.tsx
import React from 'react';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  onPin: (message: Message) => void;
  onDelete: (message: Message) => void;
  isGroup: boolean;
  groupInfo: GroupData | null;
}

// Convert IPFS hash to accessible URL
const transformIPFSLink = (hash: string) => {
  return `https://gateway.pinata.cloud/ipfs/${hash}`; 
  // Or use public gateways: ipfs.io, dweb.link
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isCurrentUser, 
  onPin,
  onDelete,
  isGroup,
  groupInfo 
}) => {
  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`relative group rounded-lg px-4 py-2 max-w-[70%] ${
        isCurrentUser ? 'bg-blue-500 text-white' : 'bg-gray-200'
      }`}>
        {isGroup && !isCurrentUser && (
          <div className="text-xs text-gray-600 mb-1">{message.sender}</div>
        )}
        <p>{message.text}</p>
        {message.file && (
          <a 
            href={`https://ipfs.io/ipfs/${message.file}`}
            target="_blank" 
            rel="noopener noreferrer"
            className={`text-sm ${isCurrentUser ? 'text-blue-100' : 'text-blue-600'} underline`}
          >
            📎 Attached File
          </a>
        )}
        <div className="absolute top-0 right-0 -mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {isCurrentUser && (
            <button 
              onClick={() => onDelete(message)}
              className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              🗑️
            </button>
          )}
          {isGroup && groupInfo && (
            <button 
              onClick={() => onPin(message)}
              className="text-xs px-2 py-1 ml-1 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              📌
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;



