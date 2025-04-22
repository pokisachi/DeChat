// ParentComponent.tsx
import React from 'react';
import ChatList from './ChatList';

const ParentComponent = () => {
  const [currentChat, setCurrentChat] = React.useState('');

  return (
    <ChatList
      selectedChat={currentChat} // Sửa tên prop và giá trị
      onChatSelect={setCurrentChat} // Sửa tên prop
    />
  );
};
