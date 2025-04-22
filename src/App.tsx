import React, { useState, useEffect } from "react";
import ChatWindow from "./components/ChatWindow";
import MessageInput from "./components/MessageInput";
import Auth from "./components/Auth";
import { initGun } from './utils/gun';
import ProfilePopup from "./components/ProfilePopup";
import Toast from "./components/Toast";
import CreateGroupModal from "./components/CreateGroupModal";
import CollapsibleGroups from './components/CollapsibleGroups';
import './index.css';

const gun = initGun();

function App() {
  const [account, setAccount] = useState<string>("");
  const [currentChat, setCurrentChat] = useState<string>("");
  const [messages, setMessages] = useState<any[]>([]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    // Subscribe to messages when currentChat changes
    if (currentChat) {
      const messagesRef = gun.get('messages').get(currentChat);
      messagesRef.map().on((data, id) => {
        if (data) {
          setMessages(prev => {
            const exists = prev.some(msg => msg.id === id);
            if (!exists) {
              return [...prev, { ...data, id }].sort((a, b) => a.timestamp - b.timestamp);
            }
            return prev;
          });
        }
      });
    }
    return () => {
      // Cleanup subscription
      if (currentChat) {
        gun.get('messages').get(currentChat).off();
      }
    };
  }, [currentChat]);

  const handleSendMessage = async (content: string) => {
    if (!account || !currentChat || !content.trim()) return;

    const messageData = {
      sender: account,
      content,
      timestamp: Date.now()
    };

    gun.get('messages').get(currentChat).set(messageData);
  };

  const showError = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-50">
      {!account ? (
        <Auth setAccount={setAccount} />
      ) : (
        <div className="h-full w-full flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-80 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h1 className="text-xl font-bold">DeChat</h1>
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <span role="img" aria-label="profile">👤</span>
                </button>
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                    <div className="py-1">
                      <button
                        onClick={() => setShowCreateGroup(true)}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Create Group
                      </button>
                      <button
                        onClick={() => setAccount("")}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <CollapsibleGroups
              account={account}
              onSelectChat={setCurrentChat}
              currentChat={currentChat}
            />
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            <ChatWindow
              messages={messages}
              currentUser={account}
            />
            <MessageInput onSendMessage={handleSendMessage} />
          </div>
        </div>
      )}

      {/* Modals */}
      {showCreateGroup && (
        <CreateGroupModal
          onClose={() => setShowCreateGroup(false)}
          account={account}
          gun={gun}
          onError={showError}
        />
      )}

      {/* Toast */}
      {showToast && (
        <Toast
          message={toastMessage}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}

export default App;
