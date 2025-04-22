import React, { useState, useRef } from "react";
import Gun from "gun";
import { encryptMessage } from "../utils/crypto";
import { pinFileToIPFS } from "../utils/pinata";

export default function MessageInput({ 
  currentUser, 
  roomId, 
  setMessages,
  isGroup = false 
}: { 
  currentUser: string; 
  roomId: string; 
  setMessages: any;
  isGroup?: boolean;
}) {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const gun = Gun();

  const handleSend = async () => {
    const secret = localStorage.getItem("secret")!;
    try {
      const messageText = text || "[File Attachment]";
      // For group messages, we'll use a shared group key instead of individual encryption
      const encryptedText = isGroup 
        ? await encryptMessage(messageText, roomId + secret) 
        : await encryptMessage(messageText, secret);
      
      let fileHash;
      if (file) {
        fileHash = await pinFileToIPFS(file);
      }

      const newMsg = {
        sender: currentUser,
        text: encryptedText,
        timestamp: Date.now(),
        file: fileHash
      };

      gun.get(roomId).set(newMsg);
      
      setMessages((prev: any[]) => [...prev, { ...newMsg, text: messageText }]);
      setText("");
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Could not send message. Please try again.");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert('File size cannot exceed 5MB');
        e.target.value = '';
        return;
      }

      if (!selectedFile.type.startsWith('image/')) {
        alert('Only image files are supported');
        e.target.value = '';
        return;
      }

      setFile(selectedFile);
    }
  };

  return (
    <div className="p-4 bg-white border-t">
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:border-blue-500"
        />
        <input
          type="file"
          onChange={handleFileSelect}
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-gray-500 hover:text-gray-700"
        >
          📎
        </button>
        <button
          onClick={handleSend}
          className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
        >
          Send
        </button>
      </div>
      {file && (
        <div className="mt-2">
          <span className="text-sm text-gray-500">Selected file: {file.name}</span>
        </div>
      )}
    </div>
  );
}
