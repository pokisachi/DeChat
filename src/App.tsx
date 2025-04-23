import React, { useState, useEffect } from "react";
import { ChatWindow } from "./components/ChatWindow";
import { MessageInput } from "./components/MessageInput";
import { Auth } from "./components/Auth";
import { initGun } from './utils/gun';
import Toast from "./components/Toast";
import CreateGroupModal from "./components/CreateGroupModal";
import CollapsibleGroups from './components/CollapsibleGroups';
import './index.css';
import { ChatView } from './components/ChatRoom';

const gun = initGun();

function App() {
  const [account, setAccount] = useState<string>("");
  const [currentChat, setCurrentChat] = useState<string>("");
  const [messages, setMessages] = useState<any[]>([]);
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
              return [...prev, { id, ...data }];
            }
            return prev;
          });
        }
      });
    }
  }, [currentChat]);

  const sendMessage = (msg: string) => {
    if (account && currentChat) {
      const message = {
        from: account,
        text: msg,
        timestamp: Date.now()
      };

      gun.get('messages').get(currentChat).set(message);
    }
  };

  return (
    <>
      {!account ? (
        <Auth setAccount={setAccount} />
      ) : (
        <div className="flex h-screen">
          <CollapsibleGroups
              gun={gun}
              account={account}
              setCurrentChat={setCurrentChat}
              showCreateGroup={showCreateGroup}
              setShowCreateGroup={setShowCreateGroup} currentChat={null} userGroups={[]}          />
          <ChatWindow messages={messages} currentUser={account} />
          <MessageInput onSendMessage={sendMessage} />
          {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}
          {showCreateGroup && (
            <CreateGroupModal
              gun={gun}
              account={account}
              onClose={() => setShowCreateGroup(false)}
              setCurrentChat={setCurrentChat}
            />
          )}
        </div>
      )}
    </>
  );
}

export default App;
