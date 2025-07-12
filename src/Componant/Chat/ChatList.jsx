import React from "react";
import style from './style.module.css'

const ChatList = ({ chats, activeChat, onChatSelect, searchTerm, onSearchChange }) => {
  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={style.sidebar}>
      <div className={style.sidebarHeader}>
        <h2 className={style.sidebarTitle}>Messages</h2>
        <div className={style.searchBox}>
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      <div className={style.chatList}>
        {filteredChats.map((chat) => (
          <div
            key={chat.id}
            className={`chatItem ${activeChat?.id === chat.id ? 'active' : ''}`}
            onClick={() => onChatSelect(chat)}
          >
            <div className={style.chatAvatar}>
              {chat.name.charAt(0).toUpperCase()}
            </div>
            <div className={style.chatInfo}>
              <h3 className={style.chatName}>{chat.name}</h3>
              <p className={style.chatPreview}>{chat.lastMessage}</p>
            </div>
            <div className={style.chatMeta}>
              <span className={style.chatTime}>{chat.time}</span>
              {chat.unreadCount > 0 && (
                <div className={style.unreadBadge}>{chat.unreadCount}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default ChatList