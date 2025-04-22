import React, { useEffect, useState, useReducer } from "react";
import ChatWindow from "./components/ChatWindow";
import MessageInput from "./components/MessageInput";
import Auth from "./components/Auth";
import { initGun } from './utils/gun';
import ProfilePopup from "./components/ProfilePopup";
import Toast from "./components/Toast";
import CreateGroupModal from "./components/CreateGroupModal";
import CollapsibleGroups from './components/CollapsibleGroups';
import './index.css';
import { ThemeProvider } from "./components/ui/theme-provider"


// Thêm interface cho Group
interface Group {
  id: string;
  name: string;
  members: Array<{
    address: string;
    role: string;
  }>;
}

// Khởi tạo gun instance
const gun = initGun();

const mockFallbackFriend = "0x0000000000000000000000000000000000000000";

function App() {
  const [account, setAccount] = useState<string>("");
  const [friend, setFriend] = useState<string>("");
  const [messages, setMessages] = useState<any[]>([]);
  const [contacts, setContacts] = useState<string[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showMyProfile, setShowMyProfile] = useState(false);
  const [showFriendProfile, setShowFriendProfile] = useState(false);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [newFriendAddress, setNewFriendAddress] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [addFriendError, setAddFriendError] = useState('');
  // Thêm state để lưu trữ tin nhắn theo roomId
  const [messagesByRoom, setMessagesByRoom] = useState<Record<string, any[]>>({});
  // Thêm state mới
  const [groups, setGroups] = useState<Group[]>([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  // Thêm state cho profile menu
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const roomId = [account, friend].sort().join(":");

  useEffect(() => {
    if (!account) return;
    const user = gun.get("online").get(account);
    user.put({ status: "online", ts: Date.now() });
    const interval = setInterval(() => user.put({ status: "online", ts: Date.now() }), 5000);
    return () => clearInterval(interval);
  }, [account]);

  useEffect(() => {
    const users = gun.get("online");
    users.map().on((data, key) => {
      if (data?.status === "online") {
        setOnlineUsers((prev) => Array.from(new Set([...prev, key])));
      } else {
        setOnlineUsers((prev) => prev.filter((x) => x !== key));
      }
    });
  }, []);

  useEffect(() => {
    if (!account) return;
    gun.get("contacts").get(account).map().on((data, key) => {
      if (data && data.address) {
        setContacts((prev) => Array.from(new Set([...prev, data.address])));
      }
    });
  }, [account]);

  useEffect(() => {
    if (account && !friend) {
      const fallback = contacts.find((f) => f !== account);
      if (fallback) setFriend(fallback);
      else setFriend(mockFallbackFriend); // gán giả lập nếu chưa có ai
    }
  }, [account, friend, contacts]);

  // Thêm useEffect để theo dõi thay đổi của friend
  useEffect(() => {
    if (!friend) return;
    
    // Tạo roomId từ 2 địa chỉ đã sắp xếp
    const roomId = [account, friend].sort().join(":");
    
    // Nếu đã có tin nhắn trong cache thì dùng lại
    if (messagesByRoom[roomId]) {
      setMessages(messagesByRoom[roomId]);
    } else {
      setMessages([]); // Reset chỉ khi chưa có trong cache
    }
  }, [friend, account, messagesByRoom]);

  // Thêm useEffect để load groups
  useEffect(() => {
    if (!account) return;

    // Reset groups when account changes
    setGroups([]);

    // Listen for user's groups
    gun.get('user_groups')
      .get(account)
      .map()
      .on((data, groupId) => {
        if (!data) return;
        
        // Get group details
        gun.get('groups')
          .get(groupId)
          .on((groupData) => {
            if (!groupData) return;
            
            setGroups(prev => {
              // Remove existing group with same ID if exists
              const filtered = prev.filter(g => g.id !== groupData.id);
              // Add updated group
              return [...filtered, groupData];
            });
          });
      });

    // Cleanup subscription
    return () => {
      gun.get('user_groups').get(account).off();
      gun.get('groups').off();
    };
  }, [account]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredContacts = [...contacts].filter(contact =>
    contact.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Hàm validate địa chỉ ví Ethereum
  const isValidEthereumAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const handleAddFriend = () => {
    // Reset error
    setAddFriendError('');

    // Kiểm tra địa chỉ rỗng
    if (!newFriendAddress) {
      setAddFriendError('Vui lòng nhập địa chỉ ví');
      return;
    }

    // Kiểm tra định dạng địa chỉ
    if (!isValidEthereumAddress(newFriendAddress)) {
      setAddFriendError('Địa chỉ ví không hợp lệ');
      return;
    }

    // Kiểm tra không được thêm chính mình
    if (newFriendAddress === account) {
      setAddFriendError('Không thể tự thêm chính mình');
      return;
    }

    // Nếu mọi thứ ok thì thêm bạn
    gun.get("contacts").get(account).set({ address: newFriendAddress });
    setShowAddFriendModal(false);
    setNewFriendAddress('');
    setShowToast(true);
  };

  const handleSetMessages = (value: any[] | ((prev: any[]) => any[])) => {
    const roomId = [account, friend].sort().join(":");
    
    if (typeof value === 'function') {
      setMessages(prevMessages => {
        const newMessages = value(prevMessages);
        setMessagesByRoom(prev => ({
          ...prev,
          [roomId]: newMessages
        }));
        return newMessages;
      });
    } else {
      setMessages(value);
      setMessagesByRoom(prev => ({
        ...prev,
        [roomId]: value
      }));
    }
  };

  // Thêm hàm xử lý logout
  const handleLogout = () => {
    setAccount("");
    localStorage.removeItem("secret");
    // Xóa các state khác
    setFriend("");
    setMessages([]);
    setContacts([]);
    setGroups([]);
    setSelectedGroup(null);
  };

  return (
    <div className="h-screen w-screen overflow-hidden">
      {!account ? (
        <Auth account={account} setAccount={setAccount} />
      ) : (
        <>
          <div className="h-full w-full flex overflow-hidden">
            {/* Sidebar với kích thước cố định */}
            <div className="w-80 flex-shrink-0 bg-gray-100 flex flex-col overflow-hidden">
              {/* Header của sidebar */}
              <div className="p-4 border-b bg-white flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-xl">💬 DeChat</h2>
                  <div className="relative">
                    <div 
                      className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-indigo-200 transition-colors"
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                    >
                      <span className="text-xl">👛</span>
                    </div>
                    
                    {/* Profile Menu Dropdown */}
                    {showProfileMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                        <button
                          onClick={() => {
                            setShowMyProfile(true);
                            setShowProfileMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          <span className="mr-2">👤</span> My Profile
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                        >
                          <span className="mr-2">🚪</span> Logout
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Thanh tìm kiếm */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm bạn bè..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full px-4 py-2 rounded-lg border bg-gray-50 pr-10"
                />
                <button
                  onClick={() => setShowAddFriendModal(true)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  title="Thêm bạn mới"
                >
                  <span className="text-xl">➕</span>
                </button>
              </div>

              {/* Danh sách bạn bè */}
              <div className="flex-1 overflow-y-auto p-4">
                {/* Groups Section */}
                <CollapsibleGroups
                  groups={groups as Array<{
                    id: string;
                    name: string;
                    description: string;
                    members: Array<{
                      address: string;
                      role: 'admin' | 'member';
                      joinedAt: number;
                    }>;
                    createdBy: string;
                    createdAt: number;
                  }>}
                  selectedGroup={selectedGroup}
                  onGroupSelect={(groupId) => {
                    setSelectedGroup(groupId);
                    setFriend('');
                  }}
                  onCreateGroup={() => setShowCreateGroup(true)}
                />

                {/* Existing Contacts Section */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Contacts</h3>
                  {filteredContacts.map((f) => (
                    <div
                      key={f}
                      onClick={() => {
                        setFriend(f);
                        setMessages([]);
                      }}
                      className={`flex items-center p-3 rounded-lg mb-2 cursor-pointer hover:bg-gray-200 transition-colors
                        ${friend === f ? "bg-indigo-50 border border-indigo-100" : "bg-white border"}`}
                    >
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <span className="text-gray-500 text-lg">
                          {f.slice(2, 4).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {f.slice(0, 6)}...{f.slice(-4)}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center">
                          <span className={`w-2 h-2 rounded-full mr-1 ${
                            onlineUsers.includes(f) ? "bg-green-500" : "bg-gray-300"
                          }`}></span>
                          {onlineUsers.includes(f) ? "Đang hoạt động" : "Không hoạt động"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Chat Window Section */}
            <div className="flex-1 flex flex-col h-full min-w-0">
              {account && (friend || selectedGroup) && (
                <>
                  {/* Header chat */}
                  <div className="p-4 border-b bg-white flex-shrink-0">
                    <div className="flex items-center cursor-pointer" onClick={() => setShowFriendProfile(true)}>
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <span className="text-gray-500 text-lg">
                          {selectedGroup 
                            ? groups.find(g => g.id === selectedGroup)?.name.slice(0, 2).toUpperCase()
                            : friend.slice(2, 4).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">
                          {selectedGroup
                            ? groups.find(g => g.id === selectedGroup)?.name
                            : `${friend.slice(0, 6)}...${friend.slice(-4)}`}
                        </div>
                        {!selectedGroup && (
                          <div className="text-xs text-gray-500 flex items-center">
                            <span className={`w-2 h-2 rounded-full mr-1 ${
                              onlineUsers.includes(friend) ? 'bg-green-500' : 'bg-gray-300'
                            }`}></span>
                            {onlineUsers.includes(friend) ? "Online" : "Offline"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Chat area */}
                  <div className="flex-1 flex flex-col min-h-0">
                    <ChatWindow 
                      currentUser={account} 
                      roomId={selectedGroup || roomId}
                      messages={messages} 
                      setMessages={handleSetMessages}
                      isGroup={!!selectedGroup}
                    />
                    <MessageInput 
                      currentUser={account} 
                      roomId={selectedGroup || roomId}
                      setMessages={handleSetMessages}
                      isGroup={!!selectedGroup}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Profile Popups */}
          {showMyProfile && (
            <ProfilePopup
              address={account}
              isOnline={true}
              onClose={() => setShowMyProfile(false)}
            />
          )}
          
          {showFriendProfile && friend && (
            <ProfilePopup
              address={friend}
              isOnline={onlineUsers.includes(friend)}
              onClose={() => setShowFriendProfile(false)}
            />
          )}

          {showAddFriendModal && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-96 relative">
                <button 
                  onClick={() => {
                    setShowAddFriendModal(false);
                    setAddFriendError('');
                    setNewFriendAddress('');
                  }}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
                
                <h3 className="text-lg font-medium mb-4">Thêm bạn mới</h3>
                
                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      value={newFriendAddress}
                      onChange={(e) => {
                        setNewFriendAddress(e.target.value);
                        setAddFriendError(''); // Clear error when typing
                      }}
                      placeholder="Nhập địa chỉ ví (0x...)"
                      className={`w-full px-4 py-2 rounded-lg border ${
                        addFriendError ? 'border-red-300' : 'border-gray-200'
                      } focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50`}
                    />
                    {addFriendError && (
                      <p className="mt-1 text-sm text-red-500">{addFriendError}</p>
                    )}
                  </div>

                  <div className="text-xs text-gray-500">
                    * Chỉ chấp nhận địa chỉ ví Ethereum hợp lệ (bắt đầu bằng 0x)
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setShowAddFriendModal(false);
                        setAddFriendError('');
                        setNewFriendAddress('');
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-700 transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleAddFriend}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Thêm
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showToast && (
            <Toast 
              message="Đã thêm bạn thành công!" 
              onClose={() => setShowToast(false)}
              type="success"
            />
          )}

          {showCreateGroup && (
            <CreateGroupModal
              currentUser={account}
              contacts={contacts}
              onClose={() => setShowCreateGroup(false)}
              onGroupCreated={(groupId) => {
                setSelectedGroup(groupId);
                setFriend('');
              }}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;
