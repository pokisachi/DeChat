import React from 'react';
    import { ChatWindow } from './ChatWindow';
    import { MessageInput } from './MessageInput';
    import { IGunInstance } from 'gun/types'; // Import type của Gun
interface ChatViewProps {
      gun: IGunInstance<any>;
      account: string;
      currentChat: string;
    }
export const ChatView: React.FC<ChatViewProps> = ({ gun, account, currentChat }) => {
      // State quản lý tin nhắn (nếu cần)
      // const [messages, setMessages] = React.useState<Message[]>([]);

      const handleSendMessage = (message: string) => {
        if (currentChat && account) {
          gun.get(currentChat).get('messages').set({
            sender: account,
            text: message,
            timestamp: Date.now(),
          });
          // Có thể thêm logic để cập nhật danh sách tin nhắn ở đây nếu cần
        }
      };

      return (
        <div className="flex flex-col h-full">
          {/* Truyền danh sách tin nhắn và thông tin người dùng cho ChatWindow */}
          {/* <ChatWindow messages={messages} currentUser={account} /> */}
          <ChatWindow messages={[]} currentUser={account} /> {/* Hiện tại truyền mảng rỗng */}

          {/* Truyền hàm xử lý gửi tin nhắn cho MessageInput */}
          <MessageInput onSendMessage={handleSendMessage} />
        </div>
      );
    };
