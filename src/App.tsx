import React, { useState, useEffect, useMemo } from "react";
import { ChatWindow } from "./components/ChatWindow";
import { MessageInput } from "./components/MessageInput";
import { AuthPage } from "./components/AuthPage";
import { initGun } from './utils/gun';
import Toast from "./components/Toast";
import CreateGroupModal from "./components/CreateGroupModal";
import CollapsibleGroups from './components/CollapsibleGroups';
import './index.css';
import { ChatView } from './components/ChatRoom';

function App() {
  const [account, setAccount] = useState<string>("");
  const [currentChat, setCurrentChat] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [userGroups, setUserGroups] = useState<GroupData[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const gun = useMemo(() => initGun(), []);

  // Fetch user groups
  useEffect(() => {
    if (account) {
      gun.get('user_groups')
        .get(account)
        .map()
        .on((data, id) => {
          if (data) {
            gun.get('groups')
              .get(id)
              .once((groupData) => {
                if (groupData) {
                  setUserGroups(prev => {
                    const exists = prev.some(g => g.id === id);
                    if (!exists) {
                      return [...prev, { ...groupData, id }];
                    }
                    return prev;
                  });
                }
              });
          }
        });
    }
  }, [account, gun]);

  useEffect(() => {
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
        <AuthPage setAccount={setAccount} />
      ) : (
        <div className="flex h-screen">
          <CollapsibleGroups
            gun={gun}
            account={account}
            currentChat={currentChat}
            setCurrentChat={setCurrentChat}
            showCreateGroup={showCreateGroup}
            setShowCreateGroup={setShowCreateGroup}
            userGroups={userGroups}
          />
          <div className="flex flex-col flex-1">
            <ChatView 
              gun={gun}
              account={account}
              currentChat={currentChat}
            />
            <MessageInput onSendMessage={sendMessage} />
          </div>
          {showToast && (
            <Toast 
              message={toastMessage} 
              onClose={() => setShowToast(false)} 
            />
          )}
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
