import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import {
  Search,
  Pin,
  VolumeX,
  Archive,
  Check,
  CheckCheck,
  Image as ImageIcon,
  Mic,
  FileText,
  Video,
  Radio,
  Users,
} from 'lucide-react';
import { Chat } from '../../types/chat';

export const ChatList: React.FC = () => {
  const {
    chats,
    activeChatId,
    setActiveChatId,
    searchQuery,
    setSearchQuery,
    currentUser,
    users,
    typingUsers,
    togglePinChat,
    toggleArchiveChat,
    toggleMuteChat,
    markChatAsRead,
  } = useChat();

  const [filterArchived, setFilterArchived] = useState(false);

  // Filter chats by search query and user participation
  const relevantChats = chats.filter(c =>
    c.participants.includes(currentUser.id) &&
    (filterArchived ? c.isArchived : !c.isArchived)
  );

  const filteredChats = relevantChats.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.lastMessage && c.lastMessage.text.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Sort pinned to top, then by last message timestamp
  const sortedChats = [...filteredChats].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    const aTime = a.lastMessage?.timestamp || a.createdAt;
    const bTime = b.lastMessage?.timestamp || b.createdAt;
    return bTime - aTime;
  });

  const formatMessageTime = (timestamp?: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getChatAvatar = (chat: Chat) => {
    if (chat.type === 'direct') {
      const otherId = chat.participants.find(p => p !== currentUser.id);
      const otherUser = users.find(u => u.id === otherId);
      return otherUser?.avatar || chat.avatar;
    }
    return chat.avatar;
  };

  const isUserOnline = (chat: Chat) => {
    if (chat.type === 'direct') {
      const otherId = chat.participants.find(p => p !== currentUser.id);
      const otherUser = users.find(u => u.id === otherId);
      return otherUser?.online || false;
    }
    return false;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-900/60">
      {/* Search Bar */}
      <div className="p-3 border-b border-slate-800/60">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats or messages..."
            className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-500 rounded-full pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Archive toggle bar */}
      <div className="px-4 py-2 flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/40">
        <button
          onClick={() => setFilterArchived(!filterArchived)}
          className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
        >
          <Archive className="w-3.5 h-3.5" />
          <span>{filterArchived ? 'View All Chats' : 'Archived Chats'}</span>
        </button>
        <span className="text-[11px] text-slate-500">{sortedChats.length} conversations</span>
      </div>

      {/* Chat List Items */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/30">
        {sortedChats.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No chats found. Click + to start a new conversation.
          </div>
        ) : (
          sortedChats.map((chat) => {
            const isActive = activeChatId === chat.id;
            const typingList = typingUsers[chat.id] || [];
            const isTyping = typingList.length > 0;
            const lastMsg = chat.lastMessage;
            const online = isUserOnline(chat);

            return (
              <div
                key={chat.id}
                onClick={() => {
                  setActiveChatId(chat.id);
                  markChatAsRead(chat.id);
                }}
                className={`group flex items-center gap-3 px-4 py-3 cursor-pointer transition-all ${
                  isActive
                    ? 'bg-slate-800/90 border-l-4 border-emerald-500'
                    : 'hover:bg-slate-800/40 border-l-4 border-transparent'
                }`}
              >
                {/* Avatar with Presence Indicator */}
                <div className="relative shrink-0">
                  <img
                    src={getChatAvatar(chat)}
                    alt={chat.name}
                    className="w-12 h-12 rounded-full object-cover border border-slate-700/60 shadow"
                  />
                  {online && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
                  )}
                  {chat.type === 'channel' && (
                    <span className="absolute -top-1 -right-1 p-0.5 bg-blue-600 rounded-full text-white">
                      <Radio className="w-2.5 h-2.5" />
                    </span>
                  )}
                  {chat.type === 'group' && (
                    <span className="absolute -top-1 -right-1 p-0.5 bg-purple-600 rounded-full text-white">
                      <Users className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>

                {/* Chat Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4 className="text-sm font-semibold text-white truncate flex items-center gap-1.5">
                      {chat.name}
                      {chat.disappearingTimer > 0 && (
                        <span className="text-[10px] text-amber-400 font-mono" title="Disappearing messages active">
                          ⏱️
                        </span>
                      )}
                    </h4>
                    <span className={`text-[11px] shrink-0 font-mono ${
                      (chat.unreadCount || 0) > 0 ? 'text-emerald-400 font-bold' : 'text-slate-400'
                    }`}>
                      {formatMessageTime(lastMsg?.timestamp || chat.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    {/* Message Preview or Typing */}
                    <p className="text-xs text-slate-400 truncate flex items-center gap-1">
                      {isTyping ? (
                        <span className="text-emerald-400 font-medium italic animate-pulse">
                          typing...
                        </span>
                      ) : lastMsg ? (
                        <>
                          {lastMsg.senderId === currentUser.id && (
                            lastMsg.status === 'read' ? (
                              <CheckCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0 inline" />
                            ) : lastMsg.status === 'delivered' ? (
                              <CheckCheck className="w-3.5 h-3.5 text-slate-400 shrink-0 inline" />
                            ) : (
                              <Check className="w-3.5 h-3.5 text-slate-400 shrink-0 inline" />
                            )
                          )}
                          {lastMsg.type === 'image' && <ImageIcon className="w-3 h-3 text-emerald-400 shrink-0 inline" />}
                          {lastMsg.type === 'voice_note' && <Mic className="w-3 h-3 text-emerald-400 shrink-0 inline" />}
                          {lastMsg.type === 'document' && <FileText className="w-3 h-3 text-emerald-400 shrink-0 inline" />}
                          {lastMsg.type === 'video' && <Video className="w-3 h-3 text-emerald-400 shrink-0 inline" />}
                          <span className="truncate">
                            {lastMsg.text.startsWith('enc:') ? '🔒 Encrypted message' : lastMsg.text}
                          </span>
                        </>
                      ) : (
                        <span className="italic text-slate-500">No messages yet</span>
                      )}
                    </p>

                    {/* Indicators: unread badge, pin, mute */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {chat.isMuted && <VolumeX className="w-3 h-3 text-slate-500" />}
                      {chat.isPinned && <Pin className="w-3 h-3 text-emerald-400 rotate-45" />}
                      {(chat.unreadCount || 0) > 0 && (
                        <span className="px-1.5 py-0.5 bg-emerald-500 text-slate-950 font-bold text-[10px] rounded-full min-w-4 text-center">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
